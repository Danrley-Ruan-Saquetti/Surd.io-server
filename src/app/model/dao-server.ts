import { IId } from "../../database/index.js"
import { IServer, Server } from "./model-server.js"

export default function ServerDao() {
    const register = async ({ name = "", isLobby = false, playersOnline = 0 }: { name: String, isLobby: Boolean, playersOnline?: Number }) => {
        const response: { server?: IServer, error?: any } = await Server.create({ name, isLobby, playersOnline }).then(async (res) => {
            return { server: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const list = async () => {
        const response: { servers?: IServer[] | null, error?: any } = await Server.find({ isLobby: false }).then(async (res) => {
            return { servers: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const listAll = async () => {
        const response: { servers?: IServer[] | null, error?: any } = await Server.find().then(async (res) => {
            return { servers: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findById = async ({ _id }: { _id: IId }) => {
        const response: { server?: IServer | null, error?: any } = await Server.findById(_id).then(async (res) => {
            return { server: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByName = async ({ name }: { name: String }) => {
        const response: { server?: IServer | null, error?: any } = await Server.findOne({ name }).then(async (res) => {
            return { server: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findLobby = async () => {
        const response: { server?: IServer | null, error?: any } = await Server.findOne({ isLobby: true }).then(async (res) => {
            return { server: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    return {
        register,
        list,
        listAll,
        findById,
        findByName,
        findLobby,
    }
}