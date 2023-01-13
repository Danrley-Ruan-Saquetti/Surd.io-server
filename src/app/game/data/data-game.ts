import { IId } from "../../../database/index.js";
import { IGame, IServer } from "../model/game.js";
import { IPlayer } from "../model/player.js";
import { IXp } from "../model/xp.js";

function DataGame() {
    const games: IGame = { servers: [] }
    const indexes: any = {}

    // Data
    const getDataByServer = ({ _id }: { _id: IId }) => {
        const data = games.servers[indexes[`${_id}`]]

        return data
    }

    const getData = () => {
        return games
    }

    // Game
    const addGame = (game: IServer) => {
        indexes[`${game._id}`] = games.servers.length
        games.servers.push(game)
    }

    // Player
    const getPlayer = ({ idSocket, idServer }: { idSocket: String, idServer: IId }) => {
        const response: { player: IPlayer | null, index: number } = (function () {
            for (let i = 0; i < getDataByServer({ _id: idServer }).players.length; i++) {
                const player = getDataByServer({ _id: idServer }).players[i];

                if (player.idSocket != idSocket) { continue }

                return { player, index: i }
            }

            return { player: null, index: -1 }
        }())

        return response
    }

    const addPlayer = ({ player, idServer }: { player: IPlayer, idServer: IId }) => {
        try {
            games.servers[indexes[`${idServer}`]].players.push(player)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const removePlayer = ({ idSocket, idServer }: { idSocket: String, idServer: IId }) => {
        try {
            const { index } = getPlayer({ idServer, idSocket })

            if (index == -1) { return false }

            games.servers[indexes[`${idServer}`]].players.splice(index, 1)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const updatePlayer = ({ player }: { player: IPlayer }) => {
        try {
            games.servers[indexes[`${player.idServer}`]].players[getPlayer({ idSocket: player.idSocket, idServer: player.idServer }).index] = player

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    // Xp
    const getXp = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        const response: { xp: IXp | null, index: number } = (function () {
            for (let i = 0; i < games.servers[indexes[`${idServer}`]].xps.length; i++) {
                const xp = games.servers[indexes[`${idServer}`]].xps[i];

                if (xp._id != _id) { continue }

                return { xp, index: i }
            }

            return { xp: null, index: -1 }
        }())

        return response
    }

    const addXp = ({ xp, idServer }: { xp: IXp, idServer: IId }) => {
        try {
            games.servers[indexes[`${idServer}`]].xps.push(xp)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const removeXp = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        try {
            const { index } = getXp({ idServer, _id })

            if (index == -1) { return false }

            games.servers[indexes[`${idServer}`]].xps.splice(index, 1)

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