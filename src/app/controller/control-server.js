import ServerDao from "../model/dao-server.js"
import { validToken } from "../util/token.service.js"

export default function ServerControl() {
    const serverDao = ServerDao()

    // Use Cases
    const createServer = async({ name, lobby = false, token }) => {
        const tokenValid = validToken(token)

        if (!tokenValid.valueOf) { return tokenValid }

        if (!name) { return { erros: { msg: "Name undefined", name: true }, status: 400 } }

        const response = await register({ name, lobby })

        if (response.error) { return { erros: { msg: "Cannot create server", system: true }, status: 400 } }

        return { success: { msg: "", system: true }, status: 200 }
    }

    const listServers = async({ token, _id }) => {
        const authValid = validToken(token, _id)

        if (!authValid.valueOf) { return authValid }

        const response = await list()

        if (response.error) { return { error: { msg: "Cannot get servers", system: true }, status: 400 } }

        const { servers } = response

        servers.forEach(server => {
            server.lobby = undefined
        })

        return { servers, status: 200 }
    }

    // Dao
    const register = async({ name = "", lobby = false }) => {
        const response = await serverDao.register({ name, lobby })

        return response
    }

    const list = async() => {
        const response = await serverDao.list()

        return response
    }

    const findById = async({ _id }) => {
        const response = await serverDao.findById({ _id })

        return response
    }

    const findByName = async({ name }) => {
        const response = await serverDao.findByName({ name })

        return response
    }

    const findLobby = async() => {
        const response = await serverDao.findLobby()

        return response
    }

    return {
        createServer,
        listServers
    }
}