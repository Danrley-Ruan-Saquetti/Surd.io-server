import { Server } from "socket.io"
import server from "../server/index.js"
import dotenv from "dotenv"
dotenv.config()

export const io = new Server(server, {
    cors: {
        origin: process.env.URL_CLIENT
    }
})

export const getSockets = async() => {
    const response = await io.fetchSockets().then(res => {

        return { sockets: res }
    }).catch(error => {
        return { error }
    })

    return response
}

export const getSocket = async(key) => {
    const responseSockets = await getSockets()

    if (responseSockets.error) { return responseSockets }

    const { sockets } = responseSockets

    const socket = sockets ? sockets.find(a => a.id == key) : undefined

    return { socket, valueOf: socket != undefined }
}

export const socketJoinRoom = async({ idSocket, keyRoom }) => {
    const responseSocket = await getSocket(idSocket)

    if (!responseSocket.valueOf) { return { error: { msg: "Host not defined", system: true }, valueOf: false } }

    const { socket } = responseSocket

    socket.rooms.clear()

    socket.join(`${keyRoom}`)

    return { success: { msg: "Host joined room successfully", system: true }, valueOf: true }
}

export const socketLeaveRoom = async({ idSocket }) => {
    const responseSocket = await getSocket(idSocket)

    if (!responseSocket.valueOf) { return { error: { msg: "Host not defined", system: true }, valueOf: false } }

    const { socket } = responseSocket

    socket.rooms.clear()

    return { success: { msg: "Host leave room successfully", system: true }, valueOf: true }
}

export const ioEmit = ({ ev = "", data = {} }) => {
    io.emit(`${ev}`, data)
}