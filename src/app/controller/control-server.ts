import { IId } from "../../database/index.js"
import ServerDao from "../model/dao-server.js"
import { validToken } from "../util/token.service.js"
import ChatControl from "./control-chat.js"

export default function ServerControl() {
    const serverDao = ServerDao()
    const chatControl = ChatControl()

    // Use Cases
    const createServer = async ({ name, isLobby = false, token }: { name: String, isLobby: Boolean, token: String }) => {
        if (!name) { return { erros: { msg: "Name undefined", name: true }, status: 400 } }

        const responseName = await findByName({ name })

        if (responseName.server) { return { erros: { msg: "Name already exist", name: true }, status: 400 } }

        const response = await register({ name, isLobby })

        if (!response.server) { return { erros: { msg: "Cannot create server", system: true }, status: 400 } }

        const { server } = response

        const responseChat = await chatControl.createChat({ idServer: server?._id || "", isServer: true })

        if (!responseChat.valueOf) {
            await server.remove()

            return responseChat
        }

        return { success: { msg: "Server created successfully", system: true }, status: 200 }
    }

    const listServers = async ({ token, idSocket }: { token: String, idSocket: String }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.valueOf) { return authValid }

        const response = await list()

        if (!response.servers) { return { error: { msg: "Cannot get servers", system: true }, status: 400 } }

        const { servers } = response

        servers.forEach(server => {
            server.isLobby = undefined
        })

        return { servers, status: 200 }
    }

    // Dao
    const register = async ({ name = "", isLobby = false }: { name: String, isLobby: Boolean }) => {
        const response = await serverDao.register({ name, isLobby })

        return response
    }

    const list = async () => {
        const response = await serverDao.list()

        return response
    }

    const findById = async ({ _id }: { _id: IId }) => {
        const response = await serverDao.findById({ _id })

        return response
    }

    const findByName = async ({ name }: { name: String }) => {
        const response = await serverDao.findByName({ name })

        return response
    }

    const findLobby = async () => {
        const response = await serverDao.findLobby()

        return response
    }

    return {
        createServer,
        listServers,
        findLobby,
        findById
    }
}