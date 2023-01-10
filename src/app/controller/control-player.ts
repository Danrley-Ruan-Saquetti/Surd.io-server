import { IId } from "../../database/index.js"
import { RULES_GAME } from "../business-rule/rules.js"
import dataGame from "../game/data/data-game.js"
import { IPlayer } from "../game/model/player"
import { ioEmit } from "../io/io.js"
import { IUser } from "../model/model-user"

export default function PlayerControl() {

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
            defense: 0,
            dimension: RULES_GAME.player.dimension,
            health: 100,
            keysMove: { DOWN: false, LEFT: false, RIGHT: false, UP: false },
            lastKeyMove: { horizontal: "", vertical: "" },
            mapKeys: [{ index: 0, key: "w" }, { index: 1, key: "s" }, { index: 2, key: "d" }, { index: 3, key: "a" }],
            level: 1,
            maxHealth: 100,
            points: 0,
            position: { x: Math.random() * (RULES_GAME.map.dimension.width - RULES_GAME.player.dimension.width) + 1, y: Math.random() * (RULES_GAME.map.dimension.height - RULES_GAME.player.dimension.height) + 1 },
            powerUps: { damage: 0, defense: 0, health: 0, size: 0, speed: 0 },
            speed: { x: 0, y: 0 },
            speedMaster: 5,
            upgradesPU: 0,
            xp: 0,
            xpUpLevel: 0
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

    // Functions Map Keys
    const moveUp = ({ player, data }: { player: IPlayer, data: { action: "keyUp" | "keyDown" } }) => {
        const move = () => {
            player.keysMove.UP = true
            player.lastKeyMove.vertical = "UP"

            if (dataGame.updatePlayer({ player })) {
                ioEmit({ ev: "$/games/players/move", data: { player }, room: player.idServer })
            }
        }

        const stop = () => {
            player.keysMove.UP = false
        }

        if (data.action == "keyDown") move()
        else if (data.action == "keyUp") stop()
    }

    const moveDown = ({ player, data }: { player: IPlayer, data: { action: "keyUp" | "keyDown" } }) => {
        const move = () => {
            player.keysMove.DOWN = true
            player.lastKeyMove.vertical = "DOWN"

            if (dataGame.updatePlayer({ player })) {
                ioEmit({ ev: "$/games/players/move", data: { player }, room: player.idServer })
            }
        }

        const stop = () => {
            player.keysMove.DOWN = false
        }

        if (data.action == "keyDown") move()
        else if (data.action == "keyUp") stop()
    }

    const moveRight = ({ player, data }: { player: IPlayer, data: { action: "keyUp" | "keyDown" } }) => {
        const move = () => {
            player.keysMove.RIGHT = true
            player.lastKeyMove.horizontal = "RIGHT"

            if (dataGame.updatePlayer({ player })) {
                ioEmit({ ev: "$/games/players/move", data: { player }, room: player.idServer })
            }
        }

        const stop = () => {
            player.keysMove.RIGHT = false
        }

        if (data.action == "keyDown") move()
        else if (data.action == "keyUp") stop()
    }

    const moveLeft = ({ player, data }: { player: IPlayer, data: { action: "keyUp" | "keyDown" } }) => {
        const move = () => {
            player.keysMove.LEFT = true
            player.lastKeyMove.horizontal = "LEFT"

            if (dataGame.updatePlayer({ player })) {
                ioEmit({ ev: "$/games/players/move", data: { player }, room: player.idServer })
            }
        }

        const stop = () => {
            player.keysMove.LEFT = false
        }

        if (data.action == "keyDown") move()
        else if (data.action == "keyUp") stop()
    }

    const mapKeys = [
        moveUp,
        moveDown,
        moveRight,
        moveLeft,
    ]

    // Update
    const updatePositionPlayer = ({ player }: { player: IPlayer }) => {
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

        if (player.speed.x != 0 || player.speed.y != 0) {
            ioEmit({ ev: "$/games/players/move", data: { player }, room: player.idServer })
        }

        dataGame.updatePlayer({ player })
    }

    return {
        createPlayer,
        quitPlayer,
        updatePositionPlayer,
        movePlayer
    }
}