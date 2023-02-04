import { IId } from "../../database/index.js"
import { RULES_GAME } from "../business-rule/rules.js"
import dataGame from "../game/data/data-game.js"
import { IEnemy } from "../game/model/enemy.js"
import { IPlayer } from "../game/model/player"
import { IProjectile } from "../game/model/projectile.js"
import { ioEmit, getSocket } from "../io/io.js"
import { IUser } from "../model/model-user"
import ProjectileControl from "./control-projectile.js"

export default function PlayerControl() {
    const projectileControl = ProjectileControl()

    const notifyCurrentPlayer = async (events: String[], idSocket: String, data: any) => {
        const response = await getSocket(idSocket)

        if (response.socket) {
            const { socket } = response

            for (let i = 0; i < events.length; i++) {
                const action = events[i]

                socket.emit(action, data)
            }
        }
    }

    const validUpgrade = ({ player, powerUp }: { player: IPlayer, powerUp: "damage" | "hp" | "defense" | "size" | "speed" | "projectileSpeed" | "projectileSize" | "criticalDamage" | "projectileRange" | "projectileReload" }) => {
        if (player.upgradesPU <= 0) { return false }

        if (player.contAlreadyUpdatePU >= RULES_GAME.powerUp.maxUpgrades) { return false }

        if (player.powerUps[powerUp] >= RULES_GAME.powerUp.lengthUpgradesPU) { return false }

        return true
    }

    // Data
    const addPlayer = ({ player, idServer }: { player: IPlayer, idServer: IId }) => {
        const response = dataGame.addPlayer({ player, idServer })

        if (response) {
            ioEmit({ ev: "$/games/players/new", data: { player }, room: idServer })
        }

        return response
    }

    const removePlayer = ({ idSocket, idServer }: { idSocket: String, idServer: IId }) => {
        const response = dataGame.removePlayer({ idSocket, idServer })

        if (response) {
            ioEmit({ ev: "$/games/players/quit", data: { player: { idSocket } }, room: idServer })

            setTimeout(() => {
                const { projectiles } = dataGame.getProjectilesByPlayer({ idServer, idSocket })

                for (let i = 0; i < projectiles.length; i++) {
                    const projectile = projectiles[i]

                    projectileControl.removeProjectile(projectile)
                }
            }, 1)
        }

        return response
    }

    // Use Case
    const createPlayer = (user: IUser, idServer: IId) => {
        const player: IPlayer = {
            _id: user._id,
            idSocket: user.idSocket || "",
            idServer: idServer,
            username: user.username,
            coins: 0,
            defense: RULES_GAME.player.defense,
            dimension: { height: RULES_GAME.player.dimension.height, width: RULES_GAME.player.dimension.width },
            damage: RULES_GAME.player.damage,
            criticalDamage: RULES_GAME.player.criticalDamage,
            hp: RULES_GAME.player.hp,
            hpMax: RULES_GAME.player.hp,
            healingCure: RULES_GAME.player.healingCure,
            keysMove: { DOWN: false, LEFT: false, RIGHT: false, UP: false },
            lastKeyMove: { horizontal: "", vertical: "" },
            level: 1,
            points: 0,
            contKills: 0,
            isPossibleShoot: true,
            timeCooldownShoot: RULES_GAME.player.timeCooldownShoot,
            isPossibleHealing: false,
            timeCooldownHealing: RULES_GAME.player.timeCooldownHealing,
            speed: { x: 0, y: 0 },
            fov: RULES_GAME.player.fov(RULES_GAME.player.dimension),
            speedMaster: RULES_GAME.player.speedMaster,
            upgradesPU: 1,
            contAlreadyUpdatePU: 0,
            xp: 0,
            xpUpLevel: RULES_GAME.player.xpUpLevel(1),
            position: { x: 100, y: 100 },
            powerUps: {
                damage: 0,
                criticalDamage: 0,
                defense: 0,
                hp: 0,
                size: 0,
                speed: 0,
                projectileSpeed: 0,
                projectileSize: 0,
                projectileRange: 0,
                projectileReload: 0,
            },
            projectile: {
                range: RULES_GAME.player.projectile.range,
                reload: RULES_GAME.player.projectile.reload,
                size: RULES_GAME.player.projectile.size,
                speed: RULES_GAME.player.projectile.speed,
            },
            mapKeys: [
                { index: 0, key: "w" },
                { index: 1, key: "s" },
                { index: 2, key: "d" },
                { index: 3, key: "a" },
            ],
        }

        return { player, valueOf: addPlayer({ player, idServer }) }
    }

    const quitPlayer = ({ idSocket, idServer }: { idSocket: String, idServer: IId }) => {
        return removePlayer({ idSocket, idServer })
    }

    const movePlayer = ({ idSocket, idServer, data }: { idSocket: String, idServer: IId, data: { key: String, action: "keyUp" | "keyDown" } }) => {
        const { player } = dataGame.getPlayer({ idSocket, idServer })

        if (!player) { return }

        const index = (function () {
            let index = -1

            for (let i = 0; i < player.mapKeys.length; i++) {
                const mKey = player.mapKeys[i];

                if (`${mKey.key}` != `${data.key}`) { continue }

                index = mKey.index
                break
            }

            return index
        }())

        if (index == -1 || !mapKeys[index]) { return }

        mapKeys[index]({ player, data })
    }

    // Update
    const playerGameOver = ({ player }: { player: IPlayer }) => {
        notifyCurrentPlayer(["$/games/players/current/game-over"], player.idSocket, { player })

        return removePlayer(player)
    }

    const updatePositionPlayer = ({ player }: { player: IPlayer }) => {
        if (!player.keysMove.DOWN && !player.keysMove.LEFT && !player.keysMove.RIGHT && !player.keysMove.UP) { return false }

        player.speed.x = 0
        player.speed.y = 0

        if (player.keysMove.UP && player.lastKeyMove.vertical == "UP") {
            player.speed.y = -player.speedMaster
        } else if (player.keysMove.DOWN && player.lastKeyMove.vertical == "DOWN") {
            player.speed.y = player.speedMaster
        }
        if (player.keysMove.LEFT && player.lastKeyMove.horizontal == "LEFT") {
            player.speed.x = -player.speedMaster
        } else if (player.keysMove.RIGHT && player.lastKeyMove.horizontal == "RIGHT") {
            player.speed.x = player.speedMaster
        }

        player.position.x += player.speed.x
        player.position.y += player.speed.y

        if (player.position.x < 0) {
            player.position.x = 0
        } else if (player.position.x + player.dimension.width > RULES_GAME.map.dimension.width) {
            player.position.x = RULES_GAME.map.dimension.width - player.dimension.width
        }
        if (player.position.y < 0) {
            player.position.y = 0
        } else if (player.position.y + player.dimension.height > RULES_GAME.map.dimension.height) {
            player.position.y = RULES_GAME.map.dimension.height - player.dimension.height
        }

        if (player.speed.x != 0 || player.speed.y != 0) {
            ioEmit({ ev: "$/games/players/move", data: { player }, room: player.idServer })
        }

        dataGame.updatePlayer({ player })

        return player.speed.x != 0 || player.speed.y != 0
    }

    const playerSetXp = ({ player, value }: { player: IPlayer, value: number }) => {
        player.xp += Math.round(value)
        player.points += Math.round(value)

        notifyCurrentPlayer(["$/games/players/current/earn-xp"], player.idSocket, { player, xp: { value } })

        while (player.xp >= player.xpUpLevel) {
            player.xp -= player.xpUpLevel
            player.level++
            player.xpUpLevel = RULES_GAME.player.xpUpLevel(player.level)
            if (player.contAlreadyUpdatePU < RULES_GAME.powerUp.maxUpgrades && player.upgradesPU < RULES_GAME.powerUp.maxUpgrades) player.upgradesPU++

            notifyCurrentPlayer(["$/games/players/current/level-up"], player.idSocket, { player })
        }

        ioEmit({ ev: "$/games/players/update", data: { player }, room: player.idServer })

        dataGame.updatePlayer({ player })
    }

    const playerSetHp = ({ player, value }: { player: IPlayer, value: number }) => {
        player.hp = (function () {
            if (player.hp + value > player.hpMax) {
                return player.hpMax
            }
            return player.hp + value
        }())

        notifyCurrentPlayer(["$/games/players/current/earn-potion"], player.idSocket, { player })

        ioEmit({ ev: "$/games/players/update", data: { player }, room: player.idServer })

        dataGame.updatePlayer({ player })

        return { isFull: player.hp == player.hpMax }
    }

    const playerUpgradePu = ({ idSocket, idServer, powerUp }: { idSocket: String, idServer: IId, powerUp: "damage" | "hp" | "defense" | "size" | "speed" | "projectileSpeed" | "projectileSize" | "criticalDamage" | "projectileRange" | "projectileReload" }) => {
        const { player } = dataGame.getPlayer({ idSocket, idServer })

        if (!player) { return }

        const validUpdate = validUpgrade({ player, powerUp })

        if (!validUpdate) { return }

        player.powerUps[powerUp]++
        player.contAlreadyUpdatePU++
        player.upgradesPU--

        const { player: p } = upgradesFunctions[powerUp]({ player })

        notifyCurrentPlayer(["$/games/players/current/upgrade"], p.idSocket, { player: p })

        dataGame.updatePlayer({ player: p })
    }

    const playerSetDamage = ({ player, value, isCritical }: { player: IPlayer, value: number, isCritical: Boolean }) => {
        player.hp -= value

        if (player.hp <= 0) {
            playerGameOver({ player })
            return { isDead: true }
        }

        // playerHealing({ player })

        ioEmit({ ev: "$/games/players/update", data: { player }, room: player.idServer })
        notifyCurrentPlayer(["$/games/players/current/upgrade", `$/games/players/current/${isCritical ? "critical-" : ""}hit`], player.idSocket, { player })

        dataGame.updatePlayer({ player })
        return { isDead: false }
    }

    const playerHealing = ({ player }: { player: IPlayer }) => {
        clearInterval(player.intervalHealing)
        clearInterval(player.intervalHealingBetween)

        player.intervalHealing = setTimeout(() => {
            player.isPossibleHealing = true
        }, player.timeCooldownHealing)

        player.intervalHealingBetween = setInterval(() => {
            if (!player.isPossibleHealing || playerSetHp({ player, value: RULES_GAME.player.healingCure }).isFull) {
                clearInterval(player.intervalHealing)
                clearInterval(player.intervalHealingBetween)
            }
        }, RULES_GAME.player.timeCooldownHealing)

        dataGame.updatePlayer({ player })
    }

    const playerSetKill = ({ player, playerDead }: { player: IPlayer, playerDead: IPlayer }) => {
        player.contKills++

        const value = (function () {
            let value = RULES_GAME.player.xpForKill

            value += playerDead.level * RULES_GAME.player.xpForKillMultiplier

            return value
        }())

        playerSetXp({ player, value })

        notifyCurrentPlayer(["$/games/players/current/upgrade", "$/games/players/current/kill"], player.idSocket, { player })

        dataGame.updatePlayer({ player })
    }

    const projectileHitPlayer = ({ player: playerHit, projectile }: { player: IPlayer, projectile: IProjectile }) => {
        const { player: playerShoot } = dataGame.getPlayer({ idSocket: projectile.idSocket, idServer: projectile.idServer })

        if (!playerShoot) { return { isDead: false } }

        const damage = (function () {
            const isCritical = Math.random() * 100 > playerShoot.criticalDamage

            return { value: isCritical ? playerShoot.damage * 3 : playerShoot.damage, isCritical }
        }())

        const { isDead } = playerSetDamage({ player: playerHit, ...damage })

        isDead && playerSetKill({ player: playerShoot, playerDead: playerHit })

        return { isDead }
    }

    const enemyHitPlayer = ({ enemy, player }: { enemy: IEnemy, player: IPlayer }) => {
        const damage = (function () {
            const isCritical = Math.random() * 100 > enemy.criticalDamage

            return { value: isCritical ? enemy.damage * 3 : enemy.damage, isCritical }
        }())

        const { isDead } = playerSetDamage({ player, ...damage })

        return { isDead }
    }

    // --Functions Map Keys

    // Upgrade PU
    const upgradesFunctions = {
        damage: ({ player }: { player: IPlayer }) => {
            player.damage += RULES_GAME.powerUp.values["damage"]

            return { player }
        },
        criticalDamage: ({ player }: { player: IPlayer }) => {
            player.criticalDamage += RULES_GAME.powerUp.values["criticalDamage"]

            return { player }
        },
        hp: ({ player }: { player: IPlayer }) => {
            player.hpMax += RULES_GAME.powerUp.values["hp"]

            return { player }
        },
        defense: ({ player }: { player: IPlayer }) => {
            player.defense += RULES_GAME.powerUp.values["defense"]

            return { player }
        },
        size: ({ player }: { player: IPlayer }) => {
            player.dimension.width += RULES_GAME.powerUp.values["size"]
            player.dimension.height += RULES_GAME.powerUp.values["size"]
            player.fov = RULES_GAME.player.fov(player.dimension)
            player.position.x -= (RULES_GAME.powerUp.values["size"] / 2)
            player.position.y -= (RULES_GAME.powerUp.values["size"] / 2)

            return { player }
        },
        speed: ({ player }: { player: IPlayer }) => {
            player.speedMaster += RULES_GAME.powerUp.values["speed"]

            return { player }
        },
        projectileSpeed: ({ player }: { player: IPlayer }) => {

            return { player }
        },
        projectileSize: ({ player }: { player: IPlayer }) => {

            return { player }
        },
        projectileRange: ({ player }: { player: IPlayer }) => {

            return { player }
        },
        projectileReload: ({ player }: { player: IPlayer }) => {
            player.timeCooldownShoot -= RULES_GAME.powerUp.values["projectileCooldown"]

            return { player }
        }
    }

    // Move
    const movePlayersFunctions = {
        moveUp: ({ player, data }: { player: IPlayer, data: { action: "keyUp" | "keyDown" } }) => {
            const move = () => {
                player.keysMove.UP = true
                player.lastKeyMove.vertical = "UP"
            }

            const stop = () => {
                player.keysMove.UP = false
            }

            if (data.action == "keyDown") move()
            else if (data.action == "keyUp") stop()
        },
        moveDown: ({ player, data }: { player: IPlayer, data: { action: "keyUp" | "keyDown" } }) => {
            const move = () => {
                player.keysMove.DOWN = true
                player.lastKeyMove.vertical = "DOWN"
            }

            const stop = () => {
                player.keysMove.DOWN = false
            }

            if (data.action == "keyDown") move()
            else if (data.action == "keyUp") stop()
        },
        moveRight: ({ player, data }: { player: IPlayer, data: { action: "keyUp" | "keyDown" } }) => {
            const move = () => {
                player.keysMove.RIGHT = true
                player.lastKeyMove.horizontal = "RIGHT"
            }

            const stop = () => {
                player.keysMove.RIGHT = false
            }

            if (data.action == "keyDown") move()
            else if (data.action == "keyUp") stop()
        },
        moveLeft: ({ player, data }: { player: IPlayer, data: { action: "keyUp" | "keyDown" } }) => {
            const move = () => {
                player.keysMove.LEFT = true
                player.lastKeyMove.horizontal = "LEFT"
            }

            const stop = () => {
                player.keysMove.LEFT = false
            }

            if (data.action == "keyDown") move()
            else if (data.action == "keyUp") stop()
        }
    }

    const mapKeys = [
        movePlayersFunctions.moveUp,
        movePlayersFunctions.moveDown,
        movePlayersFunctions.moveRight,
        movePlayersFunctions.moveLeft,
    ]

    return {
        createPlayer,
        quitPlayer,
        updatePositionPlayer,
        playerUpgradePu,
        movePlayer,
        playerSetXp,
        playerSetHp,
        playerSetKill,
        playerSetDamage,
        projectileHitPlayer,
        enemyHitPlayer,
    }
}