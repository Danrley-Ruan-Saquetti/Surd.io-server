import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import userRouter from "./router/router-user.js"
import friendRouter from "./router/router-friend.js"

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use("/users", userRouter)
app.use("/friends", friendRouter)

export default app