import Server from "./model-server.js"

export default function ServerDao() {
    const register = async({ name = "", lobby = false }) => {
        const response = await Server.create({ name, lobby }).then(async(res) => {
            return { server: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const list = async() => {
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
        const response = await Server.findOne({ lobby: true }).then(async(res) => {
            return { server: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    return {
        register,
        list,
        findById,
        findByName,
        findLobby,
    }
}