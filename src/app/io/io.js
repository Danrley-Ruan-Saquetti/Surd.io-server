import { Server } from "socket.io"
import server from "../server/index.js"
import dotenv from "dotenv"
dotenv.config()

export const io = new Server(server, {
    cors: {
        origin: process.env.URL_CLIENT
    }
})

export const ioEmit = ({ ev = "", data = {} }) => {
    io.emit(`${ev}`, data)
}