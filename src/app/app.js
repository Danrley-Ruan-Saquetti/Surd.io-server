import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import userRouter from "./router/router-user.js"

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use("/users", userRouter)

export default app