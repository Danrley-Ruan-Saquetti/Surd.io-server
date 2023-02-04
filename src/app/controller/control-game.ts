import { IId } from "../../database/index.js"
import { RULES_GAME } from "../business-rule/rules.js"
import dataGame from "../game/data/data-game.js"
import { IEnemy } from "../game/model/enemy.js"
import { IPlayer } from "../game/model/player.js"
import { IPotion } from "../game/model/potion.js"
import { IProjectile } from "../game/model/projectile.js"
import { IXp } from "../game/model/xp.js"
import { ioEmit } from "../io/io.js"
import { IUser } from "../model/model-user.js"
import { calculateAngle, calculateDistanceBetweenRectangleCircle } from "../util/calculations.js"
import { validToken } from "../util/token.service.js"
import EnemyControl from "./control-enemy.js"
import PlayerControl from "./control-player.js"
import PotionControl from "./control-potion.js"
import ProjectileControl from "./control-projectile.js"
import XpControl from "./control-xp.js"

export default function GameControl() {
    const playerControl = PlayerControl()
    const xpControl = XpControl()
    const potionControl = PotionControl()
    const projectileControl = ProjectileControl()
    const enemyControl = EnemyControl()

    const observerUserGameOver: Function[] = []

    const subscribeUserGameOver = (observerFunction: Function) => {
        observerUserGameOver.push(observerFunction)
    }

    const notifyUserGameOver = (data: any) => {
        observerUserGameOver.forEach(async (observerFunction) => {
            await observerFunction(data)
        })
    }

    const verifyCollisionRectangle = ({ position: { x: x1, y: y1 }, dimension: { width: w1, height: h1 } }: { position: { x: number, y: number }, dimension: { width: number, height: number } }, { position: { x: x2, y: y2 }, dimension: { width: w2, height: h2 } }: { position: { x: number, y: number }, dimension: { width: number, height: number } }) => {
        return ((x1 >= x2 && x1 <= x2 + w2 && y1 >= y2 && y1 <= y2 + h2) ||
            (x1 + w1 >= x2 && x1 + w1 <= x2 + w2 && y1 >= y2 && y1 <= y2 + h2) ||
            (x1 + w1 >= x2 && x1 + w1 <= x2 + w2 && y1 + h1 >= y2 && y1 + h1 <= y2 + h2) ||
            (x1 <= x2 + w2 && x1 >= x2 && y1 + h1 >= y2 && y1 + h1 <= y2 + h2))
    }

    const verifyCollisionRectangleCircle = (circle: { position: { x: number, y: number }, size: number }, rectangle: { position: { x: number, y: number }, dimension: { width: number, height: number } }) => {
        const size = circle.size

        if ((circle.position.x < rectangle.position.x && (circle.position.y < rectangle.position.y || circle.position.y > rectangle.position.y + rectangle.dimension.height))
            || (circle.position.x > rectangle.position.x + rectangle.dimension.width && (circle.position.y < rectangle.position.y || circle.position.y > rectangle.position.y + rectangle.dimension.height))) {
            return (
                calculateDistanceBetweenRectangleCircle(circle, rectangle) <= size ||
                calculateDistanceBetweenRectangleCircle(circle, { position: { x: rectangle.position.x + rectangle.dimension.width, y: rectangle.position.y } }) <= size ||
                calculateDistanceBetweenRectangleCircle(circle, { position: { x: rectangle.position.x, y: rectangle.position.y + rectangle.dimension.height } }) <= size ||
                calculateDistanceBetweenRectangleCircle(circle, { position: { x: rectangle.position.x + rectangle.dimension.width, y: rectangle.position.y + rectangle.dimension.height } }) <= size
            )
        }

        return verifyCollisionRectangle({ position: { x: circle.position.x - circle.size, y: circle.position.y - circle.size }, dimension: { width: circle.size * 2, height: circle.size * 2 } }, { position: { x: rectangle.position.x, y: rectangle.position.y }, dimension: { height: rectangle.dimension.height, width: rectangle.dimension.width } })
    }

    // Data
    const getData = async ({ token, idSocket }: { token: String, idSocket: String }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.user) { return null }

        const { user } = authValid

        const { player } = dataGame.getPlayer({ idServer: user.serverConnected || null, idSocket })

        return { data: { ...dataGame.getDataByServer({ _id: user.serverConnected || null }), powerUp: { lengthUpgradesPU: RULES_GAME.powerUp.lengthUpgradesPU } }, mapKeys: player?.mapKeys, ranking: user.serverConnected ? getRanking(user.serverConnected) : null }
    }

    const getRanking = (idServer: IId) => {
        const { players } = dataGame.getDataByServer({ _id: idServer })

        const ranking: IPlayer[] = []

        const validIdSocket = (idSocket: String) => {
            for (let i = 0; i < ranking.length; i++) {
                if (ranking[i].idSocket == idSocket) { return false }
            }
            return true
        }

        const chooseBest = (indexInitial: number, player: IPlayer) => {
            if (!validIdSocket(player.idSocket)) { return null }

            let best: IPlayer = player

            for (let i = indexInitial; i < players.length; i++) {
                const player = players[i]

                if (!validIdSocket(player.idSocket)) { continue }

                if (best.points > player.points) { continue }

                best = player
            }

            ranking.push(best)

            return best
        }

        for (let i = 0; i < players.length && i < RULES_GAME.ranking.listLength; i++) {
            const player = players[i]

            let best: IPlayer | null

            do {
                best = chooseBest(i + 1, player)
            } while (best && best.idSocket != player.idSocket);
        }

        return ranking
    }

    // Update
    const update = (idServer: IId) => {
        setTimeout(() => movePlayers({ idServer }), 1)
        setTimeout(() => moveEnemies({ idServer }), 1)
        setTimeout(() => updatePositionProjectiles({ idServer }), 1)
    }

    const verifyAll = (idServer: IId) => {
        setTimeout(() => verifyCollisionPlayerXp({ idServer }), 1)
        setTimeout(() => verifyCollisionPlayerPotion({ idServer }), 1)
        setTimeout(() => verifyCollisionPlayerProjectile({ idServer }), 1)
        setTimeout(() => verifyCollisionEnemyPlayer({ idServer }), 1)
        setTimeout(() => verifyCollisionEnemyProjectile({ idServer }), 1)
    }

    const movePlayers = ({ idServer }: { idServer: IId }) => {
        const { players } = dataGame.getDataByServer({ _id: idServer })

        for (let i = 0; i < players.length; i++) {
            const player = players[i]

            playerControl.updatePositionPlayer({ player })
        }
    }

    const moveEnemies = ({ idServer }: { idServer: IId }) => {
        const { enemies } = dataGame.getDataByServer({ _id: idServer })

        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i]

            enemyControl.moveEnemy({ enemy })
        }
    }

    const updatePositionProjectiles = ({ idServer }: { idServer: IId }) => {
        const { projectiles } = dataGame.getDataByServer({ _id: idServer })

        for (let i = 0; i < projectiles.length; i++) {
            const projectile = projectiles[i]

            projectileControl.updatePosition({ projectile })
        }
    }

    const verifyCollisionPlayerXp = ({ idServer }: { idServer: IId }) => {
        const { players, xps } = dataGame.getDataByServer({ _id: idServer })

        for (let i = 0; i < xps.length; i++) {
            const xp = xps[i]

            for (let j = 0; j < players.length; j++) {
                const player = players[j]

                if (verifyCollisionRectangle(xp, player)) {
                    playerConsumeXp({ player, xp })
                }
            }
        }
    }

    const verifyCollisionPlayerPotion = ({ idServer }: { idServer: IId }) => {
        const { players, potions } = dataGame.getDataByServer({ _id: idServer })

        for (let i = 0; i < potions.length; i++) {
            const potion = potions[i]

            for (let j = 0; j < players.length; j++) {
                const player = players[j]

                if (verifyCollisionRectangle(potion, player)) {
                    playerConsumePotion({ player, potion })
                }
            }
        }
    }

    const verifyCollisionPlayerProjectile = ({ idServer }: { idServer: IId }) => {
        const { players, projectiles } = dataGame.getDataByServer({ _id: idServer })

        for (let i = 0; i < projectiles.length; i++) {
            const projectile = projectiles[i]

            for (let j = 0; j < players.length; j++) {
                const player = players[j]

                if (projectile.idSocket == player.idSocket) { continue }

                if (verifyCollisionRectangleCircle(projectile, player)) {
                    projectileHitPlayer({ player, projectile })
                }
            }
        }
    }

    const verifyCollisionEnemyPlayer = ({ idServer }: { idServer: IId }) => {
        const { enemies, players } = dataGame.getDataByServer({ _id: idServer })

        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i]

            if (!enemy.isAvailableFollow) { continue }

            for (let j = 0; j < players.length; j++) {
                const player = players[j]

                if (verifyCollisionRectangle(player, enemy)) {
                    enemyHitPlayer({ enemy, player })
                }
            }
        }
    }

    const verifyCollisionEnemyProjectile = ({ idServer }: { idServer: IId }) => {
        const { enemies, projectiles } = dataGame.getDataByServer({ _id: idServer })

        for (let i = 0; i < projectiles.length; i++) {
            const projectile = projectiles[i]

            for (let j = 0; j < enemies.length; j++) {
                const enemy = enemies[j]

                if (verifyCollisionRectangleCircle(projectile, enemy)) {
                    projectileHitEnemy({ enemy, projectile })
                }
            }
        }
    }

    const updateRanking = (idServer: IId) => {
        const ranking = getRanking(idServer)

        ioEmit({ ev: "$/games/ranking", data: { ranking }, room: idServer })
    }

    // User
    const UserStartGame = ({ user, idServer = null }: { user: IUser, idServer?: IId }) => {
        const response = playerControl.createPlayer(user, idServer)

        return response
    }

    const UserQuitGame = ({ idSocket, idServer }: { idSocket: String, idServer: IId }) => {
        const responseRemove = playerControl.quitPlayer({ idSocket, idServer })

        return { valueOf: responseRemove }
    }

    // Player
    const movePlayer = (data: { idSocket: String, idServer: IId, data: { key: String, action: "keyUp" | "keyDown" } }) => {
        playerControl.movePlayer(data)
    }

    const upgradePU = (data: { idSocket: String, idServer: IId, powerUp: "damage" | "hp" | "defense" | "size" | "speed" | "projectileSpeed" | "projectileSize" | "criticalDamage" }) => {
        playerControl.playerUpgradePu(data)
    }

    const shootProjectile = ({ data, idServer, idSocket }: { idSocket: String, idServer: IId, data: { x: number, y: number } }) => {
        const { player } = dataGame.getPlayer({ idSocket, idServer })

        if (!player) { return }

        if (!player.isPossibleShoot) { return }

        player.isPossibleShoot = false

        setTimeout(() => {
            player.isPossibleShoot = true
        }, player.timeCooldownShoot)

        const { angle } = calculateAngle(player.position, data)

        createProjectile(player, angle)
    }

    const projectileHitPlayer = ({ player, projectile }: { player: IPlayer, projectile: IProjectile }) => {
        playerControl.projectileHitPlayer({ player, projectile }).isDead && notifyUserGameOver({ idSocket: player.idSocket })
        projectileControl.removeProjectile(projectile)
    }

    const projectileHitEnemy = ({ enemy, projectile }: { enemy: IEnemy, projectile: IProjectile }) => {
        enemyControl.projectileHitEnemy({ enemy, projectile })
        projectileControl.removeProjectile(projectile)
    }

    const enemyHitPlayer = ({ enemy, player }: { enemy: IEnemy, player: IPlayer }) => {
        playerControl.enemyHitPlayer({ enemy, player }).isDead && notifyUserGameOver({ idSocket: player.idSocket })
        enemyControl.enemyHitPlayer({ enemy })
    }

    const playerConsumeXp = ({ player, xp }: { player: IPlayer, xp: IXp }) => {
        playerControl.playerSetXp({ player, value: xp.value })
        xpControl.removeXp({ _id: xp._id, idServer: player.idServer })
    }

    const playerConsumePotion = ({ player, potion }: { player: IPlayer, potion: IPotion }) => {
        playerControl.playerSetHp({ player, value: potion.value })
        potionControl.removePotion({ _id: potion._id, idServer: player.idServer })
    }

    // Xp
    const createXpSerial = (idServer: IId) => {
        for (let i = 0; i < RULES_GAME.xps.lengthForRespawn && dataGame.getDataByServer({ _id: idServer }).xps.length < RULES_GAME.xps.maxLength; i++) {
            createXp(idServer)
        }
    }

    const createXp = (idServer: IId) => {
        return xpControl.createXp(idServer)
    }

    // Potion
    const createPotionSerial = (idServer: IId) => {
        for (let i = 0; i < RULES_GAME.potions.lengthForRespawn && dataGame.getDataByServer({ _id: idServer }).potions.length < RULES_GAME.potions.maxLength; i++) {
            createPotion(idServer)
        }
    }

    const createPotion = (idServer: IId) => {
        return potionControl.createPotion(idServer)
    }

    // Projectile
    const createProjectile = (player: IPlayer, angle: number) => {
        return projectileControl.createProjectile(player, angle)
    }

    // Enemy
    const createEnemySerial = (idServer: IId) => {
        for (let i = 0; dataGame.getDataByServer({ _id: idServer }).enemies.length < RULES_GAME.enemies.lengthMax(dataGame.getDataByServer({ _id: idServer }).players.length) && i < dataGame.getDataByServer({ _id: idServer }).players.length; i++) {
            const player = dataGame.getDataByServer({ _id: idServer }).players[i]

            for (let j = 0; j < RULES_GAME.enemies.lengthForRespawn(dataGame.getDataByServer({ _id: idServer }).players.length); j++) {
                createEnemy(idServer)
            }
        }
    }

    const createEnemy = (idServer: IId) => {
        return enemyControl.createEnemy(idServer)
    }

    return {
        subscribeUserGameOver,
        getData,
        getRanking,
        update,
        updateRanking,
        UserStartGame,
        UserQuitGame,
        movePlayer,
        shootProjectile,
        upgradePU,
        createXpSerial,
        verifyAll,
        createPotionSerial,
        createEnemySerial,
    }
}