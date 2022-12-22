import server from "./app/server/index.js"
import ("./app/io/events.js")
import dotenv from "dotenv"
dotenv.config()

const PORT = process.env.PORT || 8000

server.listen(PORT, () => {
    console.log(`[HTTP] Server running on local: ${process.env.URL_SERVER}`)
})