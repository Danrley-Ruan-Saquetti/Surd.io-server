import { io } from "./io.js"
import UserControl from "../controller/control-user.js"
import ServerControl from "../controller/control-server.js"
import ChatControl from "../controller/control-chat.js"
import PostControl from "../controller/control-post.js"
import FriendControl from "../controller/control-friend.js"
import AdminControl from "../controller/control-admin.js"

const userControl = UserControl()
const serverControl = ServerControl()
const chatControl = ChatControl()
const postControl = PostControl()
const friendControl = FriendControl()
const adminControl = AdminControl()

io.on("connection", async(socket) => {
    const idSocket = socket.id

    await userControl.EUserConnect(idSocket)

    const socketEmit = ({ ev = "", data = {} }) => {
        socket.emit(`${ev}`, data)
    }

    socket.on("disconnect", async() => {
        try {
            const response = await userControl.EUserDisconnect({ idSocket })

            response.valueOf = undefined
            response.status = undefined
        } catch (err) {
            console.log(err);
        }
    })

    // Auth
    socket.on("auth/register", async(req) => {
        try {
            const { username, email, password, idAdmin, isAdmin, token: authTokenAdmin } = req

            const response = await userControl.userRegister({ idSocket, username, email, password, idAdmin, isAdmin, token: authTokenAdmin })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "auth/register/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "auth/register/res", data: { error: { msg: "Cannot register user", system: true } } })
        }
    })

    socket.on("auth/login", async(req) => {
        try {
            const { login, password } = req

            const response = await userControl.userLogin({ idSocket, login, password })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "auth/login/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "auth/login/res", data: { error: { msg: "Cannot login user", system: true } } })
        }
    })

    socket.on("auth/login/reconnect", async(req) => {
        try {
            const { _id, authToken } = req

            const response = await userControl.userReconnect({ idSocket, _id, token: authToken })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "auth/login/reconnect/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "auth/login/reconnect/res", data: { error: { msg: "Cannot login user", system: true } } })
        }
    })

    socket.on("auth/logout", async(req) => {
        try {
            const { authToken } = req

            const response = await userControl.userLogout({ idSocket, token: authToken })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "auth/logout/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "auth/logout/res", data: { error: { msg: "Cannot logout user", system: true } } })
        }
    })

    // User
    socket.on("users", async(req) => {
        try {
            const { authToken } = req

            const response = await userControl.listUsers({ token: authToken, idSocket })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/res", data: { error: { msg: "Cannot get users", system: true } } })
        }
    })

    socket.on("users/connected", async(req) => {
        try {
            const { authToken } = req

            const response = await userControl.listUsersOnline({ token: authToken, idSocket })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/connected/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/connected/res", data: { error: { msg: "Cannot get users", system: true } } })
        }
    })

    socket.on("users/select", async(req) => {
        try {
            const { authToken } = req

            const response = await userControl.selectUser({ token: authToken, idSocket })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/select/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/select/res", data: { error: { msg: "Cannot select user", system: true } } })
        }
    })

    socket.on("users/query", async(req) => {
        try {
            const { authToken, username } = req

            const response = await userControl.queryUser({ token: authToken, idSocket, username })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/query/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/query/res", data: { error: { msg: "Cannot query user", system: true } } })
        }
    })

    socket.on("users/remove", async(req) => {
        try {
            const { authToken } = req

            const response = await userControl.userRemove({ idSocket, token: authToken })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/remove/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/remove/res", data: { error: { msg: "Cannot remove user", system: true } } })
        }
    })

    socket.on("users/forgot-password", async(req) => {
        try {
            const { authToken } = req

            const response = await userControl.userForgotPassword({ idSocket, token: authToken })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/forgot-password/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/forgot-password/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })

    socket.on("users/reset-password", async(req) => {
        try {
            const { authToken } = req

            const response = await userControl.userResetPassword({ idSocket, token: authToken })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/reset-password/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/reset-password/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })

    socket.on("users/connect-server", async(req) => {
        try {
            const { authToken, _id } = req

            const response = await userControl.userConnectServer({ _id, idSocket, token: authToken })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/reset-password/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/reset-password/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })

    // Post
    socket.on("chat", async(req) => {
        try {
            const { authToken } = req

            const response = await postControl.listPosts({ idSocket, token: authToken })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "chat/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "chat/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })

    socket.on("chat/private", async(req) => {
        try {
            const { authToken, idChat } = req

            const response = await postControl.listPosts({ idChat, idSocket, token: authToken })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "chat/private/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "chat/private/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })

    socket.on("chat/send-post", async(req) => {
        try {
            const { body, authToken } = req

            const response = await postControl.userSendPost({ idSocket, token: authToken, body })

            const { status } = response

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "chat/send-post/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "chat/send-post/res", data: { error: { msg: "Cannot send post", system: true } } })
        }
    })

    socket.on("chat/private/send-post", async(req) => {
        try {
            const { body, authToken, idChat } = req

            const response = await postControl.userSendPost({ idSocket, token: authToken, body, idChat })

            const { status } = response

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "chat/private/send-post/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "chat/private/send-post/res", data: { error: { msg: "Cannot send post", system: true } } })
        }
    })

    // Friend
    socket.on("friends", async(req) => {
        try {
            const { authToken } = req

            const response = await friendControl.listFriendsById({ idSocket, token: authToken })

            const { status } = response

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "friends/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/res", data: { error: { msg: "Cannot get friends", system: true } } })
        }
    })

    socket.on("friends/send-invite", async(req) => {
        try {
            const { authToken, _id } = req

            const response = await friendControl.sendInviteFriendship({ to: _id, idSocket, token: authToken })

            const { status } = response

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "friends/send-invite/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/send-invite/res", data: { error: { msg: "Cannot send invite", system: true } } })
        }
    })

    socket.on("friends/accept-invite", async(req) => {
        try {
            const { authToken, _id } = req

            const response = await friendControl.acceptInviteFriendship({ idSocket, token: authToken, _id })

            const { status } = response

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "friends/accept-invite/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/accept-invite/res", data: { error: { msg: "Cannot accept invite", system: true } } })
        }
    })

    socket.on("friends/denied-invite", async(req) => {
        try {
            const { authToken, _id } = req

            const response = await friendControl.deniedInviteFriendship({ idSocket, token: authToken, _id })

            const { status } = response

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "friends/denied-invite/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/denied-invite/res", data: { error: { msg: "Cannot denied invite", system: true } } })
        }
    })

    socket.on("friends/cancel-invite", async(req) => {
        try {
            const { authToken, _id } = req

            const response = await friendControl.cancelInvite({ idSocket, token: authToken, _id })

            const { status } = response

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "friends/cancel-invite/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/cancel-invite/res", data: { error: { msg: "Cannot cancel invite", system: true } } })
        }
    })

    socket.on("friends/remove-friendship", async(req) => {
        try {
            const { authToken, _id } = req

            const response = await friendControl.removeFriendship({ idSocket, token: authToken, _id })

            const { status } = response

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "friends/remove-friendship/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/remove-friendship/res", data: { error: { msg: "Cannot remove friendship", system: true } } })
        }
    })

    socket.on("friends/pending/on-hold", async(req) => {
        try {
            const { authToken } = req

            const response = await friendControl.listInvitesPendingOnHold({ idSocket, token: authToken })

            const { status } = response

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "friends/pending/on-hold/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/pending/on-hold/res", data: { error: { msg: "Cannot get invites", system: true } } })
        }
    })

    socket.on("friends/pending/awaiting", async(req) => {
        try {
            const { authToken } = req

            const response = await friendControl.listInvitesPendingAwaiting({ idSocket, token: authToken })

            const { status } = response

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "friends/pending/awaiting/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/pending/awaiting/res", data: { error: { msg: "Cannot get invites", system: true } } })
        }
    })

    socket.on("friends/denied", async(req) => {
        try {
            const { authToken } = req

            const response = await friendControl.listInvitesDeniedByUser({ idSocket, token: authToken })

            const { status } = response

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "friends/pending/awaiting/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/pending/awaiting/res", data: { error: { msg: "Cannot get invites denied", system: true } } })
        }
    })
})