import { IId } from "../../database/index.js"
import { RULES_GAME } from "../business-rule/rules.js"
import dataGame from "../game/data/data-game.js"
import { IPlayer } from "../game/model/player.js"
import { IProjectile } from "../game/model/projectile.js"
import { ioEmit } from "../io/io.js"
import generatedId from "../util/generatedId.js"

export default function ProjectileControl() {

    // Data
    const addProjectile = ({ projectile }: { projectile: IProjectile }) => {
        const response = dataGame.addProjectile({ projectile, idServer: projectile.idServer })

        if (response) {
            ioEmit({ ev: "$/games/projectiles/create", data: { projectile }, room: projectile.idServer })
        }

        return response
    }

    const removeProjectile = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        const response = dataGame.removeProjectile({ _id, idServer })

        if (response) {
            ioEmit({ ev: "$/games/projectiles/remove", data: { projectile: { _id } }, room: idServer })
        }

        return response
    }

    // Use Case
    const createProjectile = (player: IPlayer, angle: number) => {
        const projectile: IProjectile = {
            _id: generatedId(),
            idSocket: player.idSocket,
            size: RULES_GAME.projectile.size(player.powerUps.projectileSize),
            speed: { x: Math.cos(angle) * RULES_GAME.projectile.speed(player.powerUps.projectileSpeed), y: Math.sin(angle) * RULES_GAME.projectile.speed(player.powerUps.projectileSpeed) },
            idServer: player.idServer,
            position: { x: (player.position.x + (player.dimension.width / 2)) - (RULES_GAME.projectile.size(player.powerUps.projectileSize) / 2), y: (player.position.y + (player.dimension.height / 2)) - (RULES_GAME.projectile.size(player.powerUps.projectileSize) / 2) },
            color: "",
        }

        setInterval(() => removeProjectile(projectile), 1000 * 5)

        return { projectile, valueOf: addProjectile({ projectile }) }
    }

    // Update
    const updatePosition = ({ projectile }: { projectile: IProjectile }) => {
        projectile.position.x += projectile.speed.x
        projectile.position.y += projectile.speed.y

        ioEmit({ ev: "$/games/projectiles/update", data: { projectile }, room: projectile.idServer })
    }

    return {
        createProjectile,
        removeProjectile,
        updatePosition,
    }
}