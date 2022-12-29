import Server from "./model-server.js"

export default function ServerDao() {
    const register = async({ name = "", isLobby = false, playersOnline = 0 }) => {
        const response = await Server.create({ name, isLobby, playersOnline }).then(async(res) => {
            return { server: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const list = async() => {
        const response = await Server.find({ isLobby: false }).then(async(res) => {
            return { servers: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const listAll = async() => {
        const response = await Server.find().then(async(res) => {
            return { servers: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findById = async({ _id }) => {
        const response = await Server.findById(_id).then(async(res) => {
            return { server: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByName = async({ name }) => {
        const response = await Server.findOne({ name }).then(async(res) => {
            return { server: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findLobby = async() => {
        const response = await Server.findOne({ isLobby: true }).then(async(res) => {
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