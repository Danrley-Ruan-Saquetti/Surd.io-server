import { IId } from "../../database/index.js"
import { RULES_GAME } from "../business-rule/rules.js"
import dataGame from "../game/data/data-game.js"
import { IPlayer } from "../game/model/player.js"
import UserDao from "../model/dao-user.js"
import { IUser } from "../model/model-user.js"
import { validToken } from "../util/token.service.js"

export default function GameControl() {
    const userDao = UserDao()

    // Data
    const getData = async ({ token, idSocket }: { token: String, idSocket: String }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.user) { return null }

        const { user } = authValid

        return dataGame.getData({ idServer: user.serverConnected })
    }

    // User
    const UserStartGame = ({ user, idServer = null }: { user: IUser, idServer?: IId }) => {
        const player = createPlayer(user)

        return { valueOf: dataGame.addPlayer({ player, idServer: idServer ? idServer : user.serverConnected || null }), player }
    }

    const UserQuitGame = ({ user, idServer = null }: { user: IUser, idServer: IId }) => {
        const responseRemove = dataGame.removePlayer({ _id: user._id, idServer: idServer ? idServer : user.serverConnected || null })

        return { valueOf: responseRemove }
    }

    // Player
    const createPlayer = (user: IUser) => {
        const player: IPlayer = {
            _id: user._id,
            coins: 0,
            defense: 0,
            dimension: RULES_GAME.player.dimension,
            health: 100,
            keysMove: { DOWN: false, LEFT: false, RIGHT: false, UP: false },
            lastKeyMove: { horizontal: "", vertical: "" },
            level: 1,
            maxHealth: 100,
            points: 0,
            position: { x: Math.round(RULES_GAME.map.dimension.width - RULES_GAME.player.dimension.width) + 1, y: Math.round(RULES_GAME.map.dimension.height - RULES_GAME.player.dimension.height) + 1 },
            powerUps: { damage: 0, defense: 0, health: 0, size: 0, speed: 0 },
            speed: { x: 0, y: 0 },
            speedMaster: 0,
            upgradesPU: 0,
            xp: 0,
            xpUpLevel: 0
        }

        return player
    }

    return {
        UserStartGame,
        UserQuitGame,
        getData,
    }
}