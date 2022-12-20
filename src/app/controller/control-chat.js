import ChatDao from "../model/dao-chat.js"
import ServerDao from "../model/dao-server.js"

export default function ChatControl() {
    const chatDao = ChatDao()
    const serverDao = ServerDao()

    // Use Cases
    const createChat = async({ server }) => {
        const response = await register({ server })

        if (response.error) { return { error: { msg: "Cannot create server", system: true }, status: 400, valueOf: false } }

        return { success: { msg: "Chat created successfully", system: true }, status: 200, valueOf: true }
    }

    const getChat = async({ _id }) => {
        const response = await findById({ _id })

        if (!response.chat) { return { error: { msg: "Chat not found", system: true }, status: 401 } }

        const { chat } = response

        return { chat, status: 200 }
    }

    const getChatByServer = async({ server }) => {
        const response = await findByServer({ server })

        if (!response.chat) { return { error: { msg: "Chat not found", system: true }, status: 401 } }

        const { chat } = response

        return { chat, status: 200 }
    }

    // Dao
    const register = async({ server = null }) => {
        const response = await chatDao.register({ server })

        return response
    }

    const findById = async({ _id }) => {
        const response = await chatDao.findById({ _id })

        return response
    }

    const findByServer = async({ server }) => {
        const response = await chatDao.findByServer({ server })

        return response
    }

    return {
        createChat,
        getChat,
        getChatByServer,
    }
}