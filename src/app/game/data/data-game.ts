import { IId } from "../../../database/index.js";
import { IGame, IServer } from "../model/game.js";
import { IPlayer } from "../model/player.js";

function DataGame() {
    const games: IGame = { servers: [] }

    // Data
    const getDataByServer = ({ _id }: { _id: IId }) => {
        const data = games.servers.find(server => server._id == _id)

        return { data, valueOf: !(!data) }
    }

    const getData = (options: { idServer?: IId } = { idServer: null }) => {
        const data: IGame | IServer | null = options.idServer ? (function () {
            return getDataByServer({ _id: options.idServer }).data || null
        }()) : games

        return data
    }

    // Game
    const addGame = (game: IServer) => {
        games.servers.push(game)
    }

    // Server
    const getIndexServer = ({ _id }: { _id: IId }) => {
        const index = games.servers.findIndex(server => server._id == _id)

        return { index, valueOf: index > -1 }
    }

    // Player
    const getIndexPlayer = ({ _id, idServer }: { _id: IId, idServer: IId }) => {
        const serverIndex = getIndexServer({ _id: idServer })

        if (!serverIndex.valueOf) { return { index: -1, valueOf: false, serverIndex: -1 } }

        const { index: indexServer } = serverIndex

        const index = games.servers[indexServer].players.findIndex(player => player._id == _id)

        return { index, valueOf: index > -1, serverIndex: serverIndex.index }
    }

    const getPlayer = ({ _id, idServer }: { _id: IId, idServer: IId }) => {
        const serverIndex = getIndexServer({ _id: idServer })

        if (!serverIndex.valueOf) { return { player: null, valueOf: false, serverIndex: -1 } }

        const { index: indexServer } = serverIndex

        const player = games.servers[indexServer].players.find(player => player._id == _id)

        return { player, valueOf: !(!player), serverIndex: serverIndex.index }
    }

    const addPlayer = ({ player, idServer }: { player: IPlayer, idServer: IId }) => {
        const serverIndex = getIndexServer({ _id: idServer })

        if (!serverIndex.valueOf) { return false }

        const { index } = serverIndex

        games.servers[index].players.push(player)

        return true
    }

    const removePlayer = ({ _id, idServer }: { _id: IId, idServer: IId }) => {
        const userIndex = getIndexPlayer({ _id, idServer })

        if (!userIndex.valueOf) { return false }

        const { index, serverIndex } = userIndex

        games.servers[serverIndex].players.splice(index, 1)

        return true
    }

    return {
        getData,
        addGame,
        getPlayer,
        addPlayer,
        removePlayer
    }
}

const dataGame = DataGame()

export default dataGame