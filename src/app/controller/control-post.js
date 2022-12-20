import PostDao from "../model/dao-post.js"
import ChatDao from "../model/dao-chat.js"
import UserDao from "../model/dao-user.js"
import { validToken } from "../util/token.service.js"

export default function PostControl() {
    const postDao = PostDao()
    const chatDao = ChatDao()
    const userDao = UserDao()

    const register = async({ body = "", chat = null, user = null, info = false }) => {
        if (!body) { return { error: { msg: "Inform the body of post", body: true }, status: 400 } }

        const response = await registerPost({ body, user, info, chat })

        if (response.error) { return { error: { msg: "Cannot send Post", system: true }, status: 401 } }

        const { post } = response

        return { post, status: 200 }
    }

    const systemSendPost = async(body = "", chat = null) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.valueOf) { return authValid }

        const response = await register({ body, chat, info: true })

        return response
    }

    // Use Cases
    const userSendPost = async({ body = "", idSocket = null, token }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.valueOf) { return authValid }

        const { user } = authValid

        const responseChat = await chatDao.findByServer({ idServer: user.serverConnected })

        if (responseChat.error) { return { error: { msg: "Server not found", system: true }, status: 401 } }

        const { chat } = responseChat

        const response = await register({ body, chat: chat._id, user: user._id })

        return response
    }

    const listPosts = async({ idSocket, token }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.valueOf) { return authValid }

        const { user } = authValid

        const responseChat = await findPostsByIdServer({ idServer: user.serverConnected })

        if (responseChat.error) { return { error: { msg: "Cannot get posts", system: true }, status: 401 } }

        const { posts } = responseChat

        for (let i = 0; i < posts.length; i++) {
            const responseUser = await userDao.findById({ _id: posts[i].user })

            const { user } = responseUser

            user.password = undefined
            user.serverConnected = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined
            user.idSocket = undefined
            user.email = undefined

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

    return {
        systemSendPost,
        userSendPost,
        listPosts,
    }
}