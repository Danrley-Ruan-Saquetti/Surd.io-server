import { IId } from "../../database/index.js"
import ChatDao from "../model/dao-chat.js"
import PostControl from "./control-post.js"

export default function ChatControl() {
    const chatDao = ChatDao()
    const postControl = PostControl()

    // Use Cases
    const createChat = async ({ idServer = null, isServer = false, idFriend = null }: { idServer?: IId, isServer?: Boolean, idFriend?: IId }) => {
        const response = await register({ idServer, isServer, idFriend })

        if (!response.chat) { return { error: { msg: "Cannot create server", system: true }, status: 400, valueOf: false } }

        return { chat: response.chat, success: { msg: "Chat created successfully", system: true }, status: 200, valueOf: true }
    }

    const removePrivateChat = async ({ idFriend }: { idFriend: IId }) => {
        const responseChat = await findByFriend({ idFriend })

        if (responseChat.error) { return { error: { msg: "Chat not found", system: true }, status: 401 } }

        const { chat } = responseChat

        const responsePost = await postControl.findPostsByIdChat({ chat: chat?._id || "" })

        if (responseChat.error) { return { error: { msg: "Cannot delete posts", system: true }, status: 401, valueOf: false } }

        const { posts = [] } = responsePost

        if (posts) {
            for (let i = 0; i < posts.length; i++) {
                await posts[i].remove()
            }
        }

        await chat?.remove()

        return { success: { msg: "Chat removed successfully", system: true }, status: 200, valueOf: true }
    }

    const getChat = async ({ _id }: { _id: IId }) => {
        const response = await findById({ _id })

        if (!response.chat) { return { error: { msg: "Chat not found", system: true }, status: 401 } }

        const { chat } = response

        return { chat, status: 200 }
    }

    const getChatByServer = async ({ server }: { server: IId }) => {
        const response = await findByServer({ server })

        if (!response.chat) { return { error: { msg: "Chat not found", system: true }, status: 401 } }

        const { chat } = response

        return { chat, status: 200 }
    }

    const getChatByFriend = async ({ idFriend }: { idFriend: IId }) => {
        const response = await findByFriend({ idFriend })

        if (!response.chat) { return { error: { msg: "Chat not found", system: true }, status: 401 } }

        const { chat } = response

        return { chat, status: 200 }
    }

    // Dao
    const register = async ({ idServer = null, isServer = false, idFriend = null }: { idServer: IId, isServer: Boolean, idFriend: IId }) => {
        const response = await chatDao.register({ idServer, isServer, idFriend })

        return response
    }

    const findById = async ({ _id }: { _id: IId }) => {
        const response = await chatDao.findById({ _id })

        return response
    }

    const findByServer = async ({ server }: { server: IId }) => {
        const response = await chatDao.findByServer({ idServer: server })

        return response
    }

    const findByFriend = async ({ idFriend }: { idFriend: IId }) => {
        const response = await chatDao.findByFriend({ idFriend })

        return response
    }

    return {
        createChat,
        removePrivateChat,
        getChat,
        getChatByServer,
        getChatByFriend,
    }
}