function GameData() {
    const games = {}

    const addGame = (game) => {
        games[game._id] = game
    }

    return {
        games,
        addGame
    }
}

export const gameData = GameData()