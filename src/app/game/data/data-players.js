export default function PlayerData() {
    const players = {}

    const addPlayer = (player) => {
        players[player._id] = player
    }

    return {
        players,
        addPlayer
    }
}