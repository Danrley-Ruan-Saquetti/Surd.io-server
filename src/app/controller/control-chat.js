import ChatDao from "../model/dao-chat.js"
import ServerDao from "../model/dao-server.js"
import PostControl from "../controller/control-post.js"

export default function ChatControl() {
    const chatDao = ChatDao()
    const serverDao = ServerDao()
    const postControl = PostControl()

    // Use Cases
    const createChat = async({ idServer = null, isServer = false, users = null }) => {
        const response = await register({ idServer, isServer, users })

        if (response.error) { return { error: { msg: "Cannot create server", system: true }, status: 400, valueOf: false } }

        return { success: { msg: "Chat created successfully", system: true }, status: 200, valueOf: true }
    }

    const removePrivateChat = async({ users }) => {
        const responseChat = await findByUsers({ users })

        if (responseChat.error) { return { error: { msg: "Chat not found", system: true }, status: 401 } }

        const { chat } = responseChat

        const responsePost = await postControl.findPostsByIdChat({ chat: chat._id })

        if (responseChat.error) { return { error: { msg: "Cannot delete posts", system: true }, status: 401, valueOf: false } }

        const { posts } = responsePost

        for (let i = 0; i < posts.length; i++) {
            await posts[i].remove()
        }

        await chat.remove()

        return { success: { msg: "Chat removed successfully", system: true }, status: 200, valueOf: true }
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

    const getChatByUser = async({ user }) => {
        const response = await findByUser({ user })

        if (!response.chat) { return { error: { msg: "Chat not found", system: true }, status: 401 } }

        const { chat } = response

        return { chat, status: 200 }
    }

    // Dao
    const register = async({ idServer = null, isServer = false, users = null }) => {
        const response = await chatDao.register({ idServer, isServer, users })

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

    const findByUser = async({ user }) => {
        const response = await chatDao.findByUser({ user })

        return response
    }

    const findByUsers = async({ users }) => {
        const response = await chatDao.findByUsers({ users })

        return response
    }

    return {
        createChat,
        removePrivateChat,
        getChat,
        getChatByServer,
        getChatByUser,
    }
}