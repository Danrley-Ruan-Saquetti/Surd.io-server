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
            const { authToken, idChat } = req

            const response = await postControl.listPosts({ idChat, idSocket, token: authToken })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "chat/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "chat/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })

    socket.on("chat/send-post", async(req) => {
        try {
            const { body, token, id_socket, idChat } = req

            const response = await postControl.userSendPost({ idSocket: id_socket, token, body, idChat })

            const { status } = response

            response.status = undefined

            socketEmit({ ev: "chat/send-post/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "chat/send-post/res", data: { error: { msg: "Cannot send post", system: true } } })
        }
    })
})