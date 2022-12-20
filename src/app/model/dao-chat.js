import Chat from "./model-chat.js"

export default function ChatDao() {
    const register = async({ idServer = null, isServer = false, users = null }) => {
        const response = await Chat.create({ idServer, isServer, users }).then(async(res) => {
            return { chat: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const list = async() => {
        const response = await Chat.find().then(async(res) => {
            return { chats: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findById = async({ _id }) => {
        const response = await Chat.findById(_id).then(async(res) => {
            return { chat: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByServer = async({ idServer }) => {
        const response = await Chat.findOne({ idServer }).then(async(res) => {
            return { chat: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByUser = async({ user }) => {
        const response = await Chat.findOne({ users: user }).then(async(res) => {
            return { chat: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByUsers = async({ users }) => {
        const response = await Chat.findOne({ users }).then(async(res) => {
            return { chat: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    return {
        register,
        list,
        findById,
        findByServer,
        findByUser,
        findByUsers
    }
}