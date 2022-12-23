import PostDao from "../model/dao-post.js"
import ChatDao from "../model/dao-chat.js"
import UserDao from "../model/dao-user.js"
import { validToken } from "../util/token.service.js"
import { ioEmit } from "../io/io.js"

export default function PostControl() {
    const postDao = PostDao()
    const chatDao = ChatDao()
    const userDao = UserDao()

    const register = async({ body = "", isServer = false, idChat = null, idServer = null, user = null, info = false }) => {
        if (!body) { return { error: { msg: "Inform the body of post", body: true }, status: 400 } }

        const responseChat = !isServer ? await chatDao.findById({ _id: idChat }) : await chatDao.findByServer({ idServer })

        if (!responseChat.chat) { return { error: { msg: "Chat not found", system: true }, status: 401 } }

        const { chat } = responseChat

        const response = await registerPost({ body, user, info, chat: chat._id })

        if (response.error) { return { error: { msg: "Cannot send Post", system: true }, status: 401 } }

        const { post } = response

        isServer && ioEmit({ data: { post }, ev: "$/chat/send-post", room: idServer })

        return { post, status: 200 }
    }

    const systemSendPost = async({ body = "", idChat = null, idServer = null }) => {
        const response = await register({ body, idChat, isServer: idChat == null, idServer, info: true })

        return response
    }

    // Use Cases
    const userSendPost = async({ body = "", idChat = null, idSocket = null, token }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.valueOf) { return authValid }

        const { user } = authValid

        const response = await register({ body, idServer: user.serverConnected, user: user._id, idChat, isServer: idChat == null })

        return response
    }

    const listPosts = async({ idChat = null, idSocket, token }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.valueOf) { return authValid }

        const { user } = authValid

        const responsePosts = !idChat ? await findPostsByIdServer({ idServer: user.serverConnected }) : await findPostsByIdChat({ chat: idChat })

        if (responsePosts.error) { return { error: { msg: "Cannot get posts", system: true }, status: 401 } }

        const { posts } = responsePosts

        for (let i = 0; i < posts.length; i++) {
            if (!posts[i].user) { continue }

            const responseUser = await userDao.findById({ _id: posts[i].user })

            const { user } = responseUser

            user.password = undefined
            user.serverConnected = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined
            user.idSocket = undefined
            user.email = undefined
            user.lastToken = undefined

            if (!user.idAdmin) {
                user.idAdmin = undefined
            }

            posts[i].chat = undefined
            posts[i].user = user
        }

        return { posts, status: 200 }
    }

    // DaoFriend
    const registerPost = async({ body = "", chat = null, user = null, info = false }) => {
        const response = await postDao.register({ body, chat, user, info })
        return response
    }

    const findPostsByIdServer = async({ idServer }) => {
        const responseChat = await chatDao.findByServer({ idServer })

        if (responseChat.error) { return responseChat }

        const { chat } = responseChat

        const response = await postDao.listByChat({ chat: chat._id })

        return response
    }

    const findPostsByIdChat = async({ chat }) => {
        const response = await postDao.listByChat({ chat })

        return response
    }

    return {
        systemSendPost,
        userSendPost,
        listPosts,
        findPostsByIdChat,
    }
}