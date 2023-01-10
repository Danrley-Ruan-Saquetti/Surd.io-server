import { IId } from "../../../database/index.js";
import { IGame, IServer } from "../model/game.js";
import { IPlayer } from "../model/player.js";
import { IXp } from "../model/xp.js";

function DataGame() {
    const games: IGame = { servers: {} }

    // Data
    const getDataByServer = ({ _id }: { _id: IId }) => {
        const data: IServer = games.servers[`${_id}`] || null

        return data
    }

    const getData = () => {
        return games
    }

    // Game
    const addGame = (game: IServer) => {
        games.servers[`${game._id}`] = game
    }

    // Player
    const getPlayer = ({ idSocket, idServer }: { idSocket: String, idServer: IId }) => {
        const player: IPlayer = games.servers[`${idServer}`].players[`${idSocket}`]

        return { player, valueOf: !(!player) }
    }

    const addPlayer = ({ player, idServer }: { player: IPlayer, idServer: IId }) => {
        try {
            games.servers[`${idServer}`].players[`${player.idSocket}`] = player

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const removePlayer = ({ idSocket, idServer }: { idSocket: String, idServer: IId }) => {
        try {
            delete games.servers[`${idServer}`].players[`${idSocket}`]

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const updatePlayer = ({ player }: { player: IPlayer }) => {
        try {
            games.servers[`${player.idServer}`].players[`${player.idSocket}`] = player

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    // Xp
    const getXp = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        const xp: IXp = games.servers[`${idServer}`].xps[`${_id}`]

        return { xp, valueOf: !(!xp) }
    }

    const addXp = ({ xp, idServer }: { xp: IXp, idServer: IId }) => {
        try {
            games.servers[`${idServer}`].xps[`${xp._id}`] = xp

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const removeXp = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        try {
            delete games.servers[`${idServer}`].xps[`${_id}`]

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    return {
        getData,
        getDataByServer,
        addGame,
        getPlayer,
        addPlayer,
        removePlayer,
        updatePlayer,
        getXp,
        addXp,
        removeXp,
    }
}

const dataGame = DataGame()

export default dataGame