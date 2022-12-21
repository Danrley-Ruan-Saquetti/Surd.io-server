import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
// import userRouter from "./router/router-user.js"
// import friendRouter from "./router/router-friend.js"
// import serverRouter from "./router/router-server.js"
// import chatRouter from "./router/router-chat.js"
import Data from "./data/data.js"

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// app.use("/users", userRouter)
// app.use("/servers", serverRouter)
// app.use("/friends", friendRouter)
// app.use("/chats", chatRouter)

Data()

export default app