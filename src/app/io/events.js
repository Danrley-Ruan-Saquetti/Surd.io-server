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

io.on("connection", (socket) => {
    const idSocket = socket.id

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

    // User
    socket.on("users", async(req) => {
        const { token } = req

        try {
            const response = await userControl.listUsers({ token, idSocket })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/res", data: { error: { msg: "Cannot get users", system: true } } })
        }
    })

    socket.on("/users/select", async(req) => {
        const { token } = req

        try {
            const response = await userControl.selectUser({ token, idSocket })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/select/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/select/res", data: { error: { msg: "Cannot select user", system: true } } })
        }
    })

    socket.on("/users/query", async(req) => {
        const { token, username } = req

        try {
            const response = await userControl.queryUser({ token, idSocket, username })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/query/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/query/res", data: { error: { msg: "Cannot query user", system: true } } })
        }
    })

    socket.on("/users/register", async(req) => {
        const { username, email, password, idAdmin, isAdmin, tokenAdmin } = req

        try {
            const response = await userControl.userRegister({ idSocket, username, email, password, idAdmin, isAdmin, tokenAdmin })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/register/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/register/res", data: { error: { msg: "Cannot register user", system: true } } })
        }
    })

    socket.on("/users/login", async(req) => {
        const { login, password } = req

        try {
            const response = await userControl.userLogin({ idSocket, login, password })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/login/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/login/res", data: { error: { msg: "Cannot login user", system: true } } })
        }
    })

    socket.on("/users/logout", async(req) => {
        const { token } = req

        try {
            const response = await userControl.userLogout({ idSocket, token })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/logout/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/logout/res", data: { error: { msg: "Cannot logout user", system: true } } })
        }
    })

    socket.on("/users/remove", async(req) => {
        const { token } = req

        try {
            const response = await userControl.userRemove({ idSocket, token })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/remove/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/remove/res", data: { error: { msg: "Cannot remove user", system: true } } })
        }
    })

    socket.on("/users/forgot-password", async(req) => {
        const { token } = req

        try {
            const response = await userControl.userForgotPassword({ idSocket, token })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/forgot-password/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/forgot-password/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })

    socket.on("/users/reset-password", async(req) => {
        const { token } = req

        try {
            const response = await userControl.userResetPassword({ idSocket, token })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/reset-password/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/reset-password/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })

    socket.on("/users/connect-server", async(req) => {
        const { token, _id } = req

        try {
            const response = await userControl.userConnectServer({ _id, idSocket, token })

            response.valueOf = undefined
            response.status = undefined

            socketEmit({ ev: "users/reset-password/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/reset-password/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })
})