import { IId } from "../../database/index.js"
import dataGame from "../game/data/data-game.js"
import { IPlayer } from "../game/model/player.js"
import { IUser } from "../model/model-user.js"
import { validToken } from "../util/token.service.js"
import PlayerControl from "./control-player.js"
import XpControl from "./control-xp.js"

export default function GameControl() {
    const playerControl = PlayerControl()
    const xpControl = XpControl()

    // Data
    const getData = async ({ token, idSocket }: { token: String, idSocket: String }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.user) { return null }

        const { user } = authValid

        const { player } = dataGame.getPlayer({ idServer: user.serverConnected || null, idSocket })

        return { data: dataGame.getDataByServer({ _id: user.serverConnected || null }), mapKeys: player.mapKeys }
    }

    // Update
    const update = (idServer: IId) => {
        Object.keys(dataGame.getDataByServer({ _id: idServer }).players).map(key => {
            const player: IPlayer = dataGame.getDataByServer({ _id: idServer }).players[key]

            playerControl.updatePositionPlayer({ player })
        })
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
    const mapKeys = { // Temporary
        keysValid: { w: true, a: true, s: true, d: true }
    }

    const movePlayer = (data: { idSocket: String, idServer: IId, data: { key: String, action: "keyUp" | "keyDown" } }) => {
        playerControl.movePlayer(data)
    }

    // Xp
    const createXp = (idServer: IId) => {
        return xpControl.createXp(idServer)
    }

    return {
        getData,
        update,
        UserStartGame,
        UserQuitGame,
        movePlayer,
        createXp,
    }
}