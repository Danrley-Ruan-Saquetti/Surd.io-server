import server from "./app/server/index.js"
import("./app/io/events.js")
import dotenv from "dotenv"
import runningGame from "./app/game/running-game.js"
dotenv.config()

const PORT = process.env.PORT || 8000

server.listen(PORT, async () => {
    await runningGame.startGames()
    console.log(`[HTTP] Server running on local: ${process.env.URL_SERVER}`)
})