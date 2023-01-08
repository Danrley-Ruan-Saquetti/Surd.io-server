import { IId } from "../../../database/index.js";
import { IGame, IServer } from "../model/game.js";
import { IPlayer } from "../model/player.js";

function DataGame() {
    const games: IGame = { servers: {} }

    // Data
    const getDataByServer = ({ _id }: { _id: IId }) => {
        const data = games.servers[`${_id}`] || null

        return data
    }

    const getData = (options: { idServer?: IId } = { idServer: null }) => {
        const data: IGame | IServer | null = options.idServer ? getDataByServer({ _id: options.idServer }) : games

        return data
    }

    // Game
    const addGame = (game: IServer) => {
        games.servers[`${game._id}`] = game
        console.log(games);

    }

    // Server

    // Player
    const getPlayer = ({ _id, idServer }: { _id: IId, idServer: IId }) => {
        const player = games.servers[`${idServer}`].players[`${_id}`]

        return { player, valueOf: !(!player) }
    }

    const addPlayer = ({ player, idServer }: { player: IPlayer, idServer: IId }) => {
        games.servers[`${idServer}`].players[`${player._id}`] = player

        return true
    }

    const removePlayer = ({ _id, idServer }: { _id: IId, idServer: IId }) => {
        delete games.servers[`${idServer}`].players[`${_id}`]

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