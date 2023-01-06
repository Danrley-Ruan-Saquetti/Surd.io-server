import { Server } from "socket.io"
import dotenv from "dotenv"
import server from "../server/index.js"
dotenv.config()

export const io = new Server(server, {
    cors: {
        origin: process.env.URL_CLIENT
    }
})

export const getSockets = async () => {
    const response: { sockets?: any[], error?: any } = await io.fetchSockets().then(res => {
        return { sockets: res }
    }).catch(error => {
        console.log(error);
        return { error }
    })

    return response
}

export const getSocket = async (key: String) => {
    const responseSockets = await getSockets()

    if (responseSockets.error) { return { ...responseSockets, valueOf: false } }

    const { sockets } = responseSockets

    const socket = sockets ? sockets.find(a => a.id == key) : undefined

    return { socket, valueOf: socket != undefined }
}

export const socketJoinRoom = async ({ idSocket, keyRoom }: { idSocket: String, keyRoom: String }) => {
    const responseSocket = await getSocket(idSocket)

    if (!responseSocket.valueOf) { return { error: { msg: "Host not defined", system: true }, valueOf: false } }

    const { socket } = responseSocket

    socket.rooms.clear()

    socket.join(`${keyRoom}`)

    return { success: { msg: "Host joined room successfully", system: true }, valueOf: true }
}

export const socketLeaveRoom = async ({ idSocket }: { idSocket: String }) => {
    const responseSocket = await getSocket(idSocket)

    if (!responseSocket.valueOf) { return { error: { msg: "Host not defined", system: true }, valueOf: false } }

    const { socket } = responseSocket

    socket.rooms.clear()

    return { success: { msg: "Host leave room successfully", system: true }, valueOf: true }
}

export const ioEmit = ({ ev = "", room = "", data = {} }: { ev: String, room: any, data: any }) => {
    !room ? io.emit(`${ev}`, data) : io.to(`${room}`).emit(`${ev}`, data)
}