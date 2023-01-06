import { IId } from "../../database/index.js"
import dataGame from "../game/data/data-game.js"
import { IPlayer } from "../game/model/player.js"
import { IUser } from "../model/model-user.js"

export default function GameControl() {

    // User
    const UserStartGame = ({ user, idServer = null }: { user: IUser, idServer?: IId }) => {
        const player = createPlayer(user)

        console.log(dataGame.getData());

        return dataGame.addPlayer({ player, idServer: idServer ? idServer : user.serverConnected || null })
    }

    const UserQuitGame = ({ user, idServer = null }: { user: IUser, idServer?: IId }) => {
        const responseRemove = dataGame.removePlayer({ _id: user._id, idServer: idServer ? idServer : user.serverConnected || null })

        console.log(dataGame.getData());

        return responseRemove
    }

    // Player
    const createPlayer = (user: IUser) => {
        const player: IPlayer = {
            _id: user._id,
            coins: 0,
            defense: 0,
            dimension: { height: 0, width: 0 },
            health: 100,
            keysMove: { DOWN: false, LEFT: false, RIGHT: false, UP: false },
            lastKeyMove: { horizontal: "", vertical: "" },
            level: 1,
            maxHealth: 100,
            points: 0,
            position: { x: 0, y: 0 },
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
    }
}