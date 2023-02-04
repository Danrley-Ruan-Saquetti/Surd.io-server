import { IId } from "../../database"
import { RULES_GAME } from "../business-rule/rules.js"
import dataGame from "../game/data/data-game.js"
import { IEnemy } from "../game/model/enemy"
import { IPlayer } from "../game/model/player"
import { IProjectile } from "../game/model/projectile"
import { ioEmit } from "../io/io.js"
import { calculateAngle, calculateDistance } from "../util/calculations.js"
import generatedId from "../util/generatedId.js"

export default function EnemyControl() {

    // Data
    const addEnemy = ({ enemy, idServer }: { enemy: IEnemy, idServer: IId }) => {
        const response = dataGame.addEnemy({ enemy, idServer })

        if (response) {
            ioEmit({ ev: "$/games/enemies/create", data: { enemy }, room: idServer })
        }

        return response
    }

    const removeEnemy = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        const response = dataGame.removeEnemy({ _id, idServer })

        if (response) {
            ioEmit({ ev: "$/games/enemies/remove", data: { enemy: { _id } }, room: idServer })
        }

        return response
    }

    // Use Case
    const createEnemy = (idServer: IId) => {
        const indexValue = {
            value: Math.round(Math.random() * 100),
            index: -1
        }

        for (let i = 0; i < RULES_GAME.enemies.types.length; i++) {
            const xp = RULES_GAME.enemies.types[i];

            if (indexValue.value <= xp.tx || i == RULES_GAME.enemies.types.length - 1) {
                indexValue.index = i
                break
            }
        }

        const enemyLevel = RULES_GAME.enemies.types[indexValue.index]

        const enemy: IEnemy = {
            _id: generatedId(),
            idServer,
            target: null,
            targetRange: enemyLevel.range,
            isAvailableFollow: true,
            dimension: { height: enemyLevel.dimension.height, width: enemyLevel.dimension.width },
            position: { x: Math.random() * (RULES_GAME.map.dimension.width - enemyLevel.dimension.width) + 1, y: Math.random() * (RULES_GAME.map.dimension.height - enemyLevel.dimension.height) + 1 },
            level: indexValue.index + 1,
            criticalDamage: enemyLevel.criticalDamage,
            damage: enemyLevel.damage,
            hp: enemyLevel.hp,
            hpMax: enemyLevel.hp,
            speed: { x: 0, y: 0 },
            speedMaster: enemyLevel.speed,
            color: enemyLevel.color
        }

        return { enemy, valueOf: addEnemy({ enemy, idServer }) }
    }

    // Use Cases
    const getPlayerByTarget = ({ enemy: { target: idSocket, idServer } }: { enemy: IEnemy }) => {
        if (!idSocket) { return { player: null } }

        const { player } = dataGame.getPlayer({ idSocket, idServer })

        return { player }
    }

    const getNewTarget = ({ enemy }: { enemy: IEnemy }) => {
        let newTarget: String | null = enemy.target

        for (let i = 0; i < dataGame.getDataByServer({ _id: enemy.idServer }).players.length; i++) {
            const player = dataGame.getDataByServer({ _id: enemy.idServer }).players[i]

            if (player.idSocket == enemy.target) { continue }

            const distancePlayerEnemy = calculateDistance(enemy, player)

            if (distancePlayerEnemy > enemy.targetRange) { continue }

            const currentTarget = getPlayerByTarget({ enemy }).player

            if (!currentTarget) {
                newTarget = player.idSocket
                continue
            }

            const distanceCurrentTarget = calculateDistance(enemy, currentTarget)

            if (distanceCurrentTarget < distancePlayerEnemy) { continue }

            newTarget = player.idSocket
        }

        return newTarget
    }

    const enemySetDamage = ({ enemy, value, isCritical }: { enemy: IEnemy, value: number, isCritical: Boolean }) => {
        enemy.hp -= value

        if (enemy.hp <= 0) {
            removeEnemy(enemy)
        }

        ioEmit({ ev: "$/games/enemies/update", data: { enemy }, room: enemy.idServer })
        ioEmit({ ev: `$/games/enemies/current/${isCritical ? "critical-" : ""}hit`, data: { enemy }, room: enemy.idServer })

        dataGame.updateEnemy({ enemy })
    }

    const moveEnemy = ({ enemy }: { enemy: IEnemy }) => {
        if (!enemy.isAvailableFollow) { return }

        enemy.target = getNewTarget({ enemy })
        enemy.speed.x = 0
        enemy.speed.y = 0

        const { player } = getPlayerByTarget({ enemy })

        if (!enemy.target || !player) { return dataGame.updateEnemy({ enemy }) }

        const { angle } = calculateAngle(enemy.position, player.position)

        enemy.speed.x = Math.cos(angle) * enemy.speedMaster
        enemy.speed.y = Math.sin(angle) * enemy.speedMaster

        enemy.position.x += enemy.speed.x
        enemy.position.y += enemy.speed.y

        ioEmit({ ev: "$/games/enemies/update", data: { enemy }, room: enemy.idServer })

        dataGame.updateEnemy({ enemy })
    }

    const enemyHitPlayer = ({ enemy }: { enemy: IEnemy }) => {
        enemy.isAvailableFollow = false

        setTimeout(() => {
            enemy.isAvailableFollow = true

            dataGame.updateEnemy({ enemy })
        }, 1000 * 1)

        dataGame.updateEnemy({ enemy })
    }

    const projectileHitEnemy = ({ projectile, enemy }: { projectile: IProjectile, enemy: IEnemy }) => {
        const { player: playerShoot } = dataGame.getPlayer({ idSocket: projectile.idSocket, idServer: projectile.idServer })

        if (!playerShoot) { return }

        const damage = (function () {
            const isCritical = Math.random() * 100 > playerShoot.criticalDamage

            return { value: isCritical ? playerShoot.damage * 3 : playerShoot.damage, isCritical }
        }())

        enemySetDamage({ enemy, ...damage })
    }

    return {
        removeEnemy,
        createEnemy,
        moveEnemy,
        enemyHitPlayer,
        projectileHitEnemy,
    }
}