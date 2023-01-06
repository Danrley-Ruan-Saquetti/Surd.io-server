import PostDao from "../model/dao-post.js"
import ChatDao from "../model/dao-chat.js"
import UserDao from "../model/dao-user.js"
import FriendDao from "../model/dao-friend.js"
import { validToken } from "../util/token.service.js"
import { ioEmit, getSocket } from "../io/io.js"
import { IId } from "../../database/index.js"

export default function PostControl() {
    const postDao = PostDao()
    const chatDao = ChatDao()
    const userDao = UserDao()
    const friendDao = FriendDao()

    const register = async ({ body = "", isServer = false, idChat = null, idServer = null, user = null, info = false }: { body: String, isServer: Boolean, idChat: IId, idServer: IId, user?: IId, info?: Boolean }) => {
        if (!body) { return { error: { msg: "Inform the body of post", body: true }, status: 400 } }

        const responseChat = !isServer ? await chatDao.findById({ _id: idChat }) : await chatDao.findByServer({ idServer })

        if (!responseChat.chat) { return { error: { msg: "Chat not found", system: true }, status: 401 } }

        const { chat } = responseChat

        const response = await registerPost({ body, user, info, chat: chat._id })

        if (response.error) { return { error: { msg: "Cannot send Post", system: true }, status: 401 } }

        const { post } = response

        if (isServer) {
            ioEmit({ data: { post }, ev: "$/chat/send-post", room: idServer })
        } else {
            const responseFriend = await friendDao.findFriendshipById({ _id: chat.idFriend || null })

            if (responseFriend.friendship) {
                const responseUser1 = await userDao.findById({ _id: responseFriend.friendship.users[0] })
                const responseUser2 = await userDao.findById({ _id: responseFriend.friendship.users[1] })

                const responseSocket1 = responseUser1.user && responseUser1.user.online ? await getSocket(responseUser1.user.idSocket || "") : { valueOf: false }
                const responseSocket2 = responseUser2.user && responseUser2.user.online ? await getSocket(responseUser2.user.idSocket || "") : { valueOf: false }

                responseSocket1.valueOf && responseSocket1.socket.emit("$/chat/private/send-post", { msg: `User send post` })
                responseSocket2.valueOf && responseSocket2.socket.emit("$/chat/private/send-post", { msg: `User send post` })
            }
        }

        return { post, status: 200 }
    }

    const systemSendPost = async ({ body = "", idChat = null, idServer = null }: { body: String, idChat?: IId, idServer?: IId }) => {
        const response = await register({ body, idChat, isServer: !(!idChat), idServer, info: true })

        return response
    }

    // Use Cases
    const userSendPost = async ({ body = "", idChat = null, idSocket = "", token }: { body: String, idChat?: IId, idSocket: String, token: String }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.valueOf) { return authValid }

        const { user } = authValid

        const response = await register({ body, idServer: user?.serverConnected || null, user: user?._id || null, idChat, isServer: idChat == null })

        return response
    }

    const listPosts = async ({ idChat = null, idSocket, token }: { idChat?: IId, idSocket: String, token: String }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.valueOf) { return authValid }

        const { user } = authValid

        const responsePosts = user ? !idChat ? await findPostsByIdServer({ idServer: user.serverConnected || null }) : await findPostsByIdChat({ chat: idChat }) : { error: {} }

        if (!responsePosts.posts) { return { error: { msg: "Cannot get posts", system: true }, status: 401 } }

        const { posts } = responsePosts

        for (let i = posts.length - 1; i >= 0; i--) {
            if (!posts[i].user) { continue }

            const responseUser = await userDao.findById({ _id: posts[i].user || null })

            const { user } = responseUser

            if (!user) { continue }

            // @ts-expect-error
            user.password = undefined
            user.serverConnected = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined
            user.idSocket = undefined
            // @ts-expect-error
            user.email = undefined
            user.lastToken = undefined

            if (!user.idAdmin) {
                user.idAdmin = undefined
            }

            // @ts-expect-error
            posts[i].chat = undefined
            // @ts-expect-error
            posts[i].user = user
        }

        posts.reverse()

        return { posts, status: 200 }
    }

    // DaoFriend
    const registerPost = async ({ body = "", chat = null, user = null, info = false }: { body: String, chat: IId, user: IId, info: Boolean }) => {
        const response = await postDao.register({ body, chat, user, info })
        return response
    }

    const findPostsByIdServer = async ({ idServer }: { idServer: IId }) => {
        const responseChat = await chatDao.findByServer({ idServer })

        if (responseChat.error) { return { ...responseChat, chat: undefined, posts: [] } }

        const { chat } = responseChat

        const response = chat ? await postDao.listByChat({ chat: chat._id }) : { error: {} }

        return response
    }

    const findPostsByIdChat = async ({ chat }: { chat: IId }) => {
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