import bcryptjs from "bcryptjs"
import crypto from "crypto"
import UserDao from "../model/dao-user.js"
import ServerControl from "./control-server.js"
import { generatedToken, validToken } from "../util/token.service.js"
import AdminControl from "./control-admin.js"
import PostControl from "./control-post.js"
import { RULES_USER } from "../business-rule/rules.js"

export default function UserControl() {
    const userDao = UserDao()
    const serverControl = ServerControl()
    const adminControl = AdminControl()
    const postControl = PostControl()

    const verifyValuesAlreadyExists = async({ username, email, _id = null }) => {
        const error = []

        const { user: userUsername } = await findByUsername({ username })

        if (userUsername) {
            if (_id) {
                if (_id != userUsername._id) {
                    error.push({ msg: "Username already exist", username: true })
                }
            } else {
                error.push({ msg: "Username already exist", username: true })
            }
        }

        const { user: userEmail } = await findByEmail({ email })

        if (userEmail) {
            if (_id) {
                if (_id && _id != userEmail._id) {
                    error.push({ msg: "E-mail already exist", email: true })
                }
            } else {
                error.push({ msg: "E-mail already exist", email: true })
            }
        }

        return { error, valueOf: error.length == 0 }
    }

    const validAuthentication = async({ login, password }) => {
        const responseEmail = await findByEmail({ email: login })

        let user = null

        if (responseEmail.user) {
            user = responseEmail.user
        } else {
            const responseUsername = await findByUsername({ username: login })

            if (responseUsername.user) { user = responseUsername.user }
        }

        if (!user) { return { error: { msg: "User not found", system: true }, valueOf: false } }

        if (!await bcryptjs.compare(password, user.password)) { return { error: { msg: "Password incorrect", password: true }, valueOf: false } }

        return { user, error: [], valueOf: true }
    }

    // Use Cases
    const userRegister = async({ username = "", email = "", password = "", isAdmin = false, idAdmin = null, tokenAdmin = null, idSocket }) => {
        const responseSocket = await findByIdSocket({ idSocket })

        if (responseSocket.user) { return { error: { msg: "Host already connected", system: true }, status: 401 } }

        const valuesVerified = RULES_USER.VALID_REGISTER({ username, email, password })

        if (!valuesVerified.valueOf) { return { error: valuesVerified.error, status: 400 } }

        const valuesAlreadyExistsVerified = await verifyValuesAlreadyExists({ email, username })

        if (!valuesAlreadyExistsVerified.valueOf) { return { error: valuesAlreadyExistsVerified.error, status: 400 } }

        const response = await register({ username, email, password: await bcryptjs.hash(password, 5), idSocket })

        if (response.error) { return { error: { msg: "Cannot register user", system: true }, status: 400 } }

        const { user } = response

        let warning = null

        if (isAdmin) {
            const responseAdmin = await adminControl.createAdmin({ user, idAdmin, tokenAdmin })

            if (!responseAdmin.valueOf) {
                user.remove()

                return responseAdmin
            }

            const { admin } = responseAdmin

            user.idAdmin = admin._id
        } else {
            const responseLobby = await serverControl.findLobby()

            let _idServer = null

            if (!responseLobby.server) {
                warning = { msg: "Cannot connected lobby", system: true }
            } else {
                const { server } = responseLobby
                _idServer = server._id
            }

            const token = generatedToken({ id: user, admin: isAdmin })

            user.authToken = token
            user.online = true
            user.serverConnected = _idServer

            postControl.systemSendPost({ body: `User ${username} connected`, idServer: user.serverConnected })
        }

        await user.save()

        user.password = undefined
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        user.idSocket = undefined
        user.serverConnected = undefined

        return { user, success: { msg: "User created successfully", system: true }, warning, status: 200 }
    }

    const userLogin = async({ login = "", password = "", idSocket }) => {
        if (!login) {
            return { error: { msg: "Inform the e-mail or username", login: true }, status: 400 }
        } else {
            if (login.split(" ").length > 1) {
                return { error: { msg: "Login incorrect", login: true }, status: 400 }
            }
        }
        if (!password) {
            return { error: { msg: "Inform the password", password: true }, status: 400 }
        }

        const responseSocket = await findByIdSocket({ idSocket })

        if (responseSocket.user) { return { error: { msg: "Host already connected", system: true }, status: 401 } }

        const validAuth = await validAuthentication({ login, password })

        if (!validAuth.valueOf) { return { error: validAuth.error, status: 401 } }

        const { user } = validAuth

        if (user.online) { return { error: { msg: "User already logged in this moment", system: true }, status: 401 } }

        const responseLobby = await serverControl.findLobby()

        if (!responseLobby.server) { return { error: { msg: "Cannot connect lobby, try again", system: true }, status: 401 } }

        const { server } = responseLobby

        const token = generatedToken({ id: user, admin: user.idAdmin })

        user.authToken = token
        user.online = true
        user.serverConnected = server._id
        user.idSocket = idSocket
        user.lastTimeOnline = Date.now()

        postControl.systemSendPost({ body: `User ${user.username} connected`, idServer: user.serverConnected })

        await user.save()

        user.password = undefined
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        user.serverConnected = undefined
        user.idSocket = undefined

        if (!user.idAdmin) {
            user.idAdmin = undefined
        }

        return { user, success: { msg: "User logged successfully", system: true }, status: 200 }
    }

    const userLogout = async({ token, idSocket }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.valueOf) { return authValid }

        const { user } = authValid

        postControl.systemSendPost({ body: `User ${username} disconnected`, idServer: user.serverConnected })

        user.online = false
        user.lastTimeOnline = Date.now()
        user.serverConnected = null
        user.authToken = null
        user.idSocket = null

        await user.save()

        return { success: { msg: "User logged out successfully", system: true }, status: 200 }
    }

    const userRemove = async({ token, idSocket }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.valueOf) { return authValid }

        const { user } = authValid

        await user.remove()

        return { success: { msg: "User removed successfully", system: true }, status: 200 }
    }

    const userForgotPassword = async({ email }) => {
        const response = await findByEmail({ email })

        if (response.error) { return { error: { msg: "User not found", email: true }, status: 400 } }

        const { user } = response

        const token = crypto.randomBytes(20).toString("hex")

        const now = new Date()
        now.setHours(now.getHours() + 1)

        user.passwordResetToken = token
        user.passwordResetExpires = now

        await user.save()

        return { status: 200, success: { msg: "Check your e-mail for reset password", system: true }, token }
    }

    const userResetPassword = async({ email, password, token }) => {
        const response = await findByEmail({ email })

        if (response.error) { return { error: { msg: "User not found", email: true }, status: 400 } }

        const { user } = response

        if (token != user.passwordResetToken) { return { error: { msg: "Token invalid", system: true }, status: 400 } }

        if (new Date() > user.passwordResetExpires) { return { error: { msg: "TokToken expired, generated a new one", system: true }, status: 400 } }

        user.password = await bcryptjs.hash(password, 5)
        user.passwordResetToken = null
        user.passwordResetExpires = null

        await user.save()

        return { success: { msg: "Reset password successfully", system: true }, status: 200 }
    }

    const userConnectServer = async({ _id, token, idSocket }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.valueOf) { return authValid }

        const { user } = authValid

        if (user.idSocket != idSocket) { return { error: { msg: "Host not connected", system: true }, status: 401 } }

        const responseServer = await serverControl.findById({ _id })

        if (!responseServer.server) { return { error: { msg: "Cannot connect lobby, try again", system: true }, status: 401 } }

        const { server } = responseServer

        user.serverConnected = server._id

        postControl.systemSendPost({ body: `User ${username} connected`, idServer: user.serverConnected })

        await user.save()

        return { success: { msg: "Server connected successfully", system: true }, status: 200 }
    }

    const queryUser = async({ username = "", token, idSocket }) => {
        const tokenValid = await validToken(token, idSocket)

        if (!tokenValid.valueOf) { return { error: tokenValid.error, status: 400 } }

        const response = await findByUsername({ username })

        if (response.error) { return { error: { msg: "User not found", username: true }, status: 400 } }

        const { user } = response

        user.password = undefined
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        user.authToken = undefined
        user.idSocket = undefined
        user.email = undefined

        return { user, status: 200 }
    }

    const selectUser = async({ idSocket, token }) => {
        const tokenValid = await validToken(token, idSocket)

        if (!tokenValid.valueOf) { return { error: tokenValid.error, status: 400 } }

        const { user } = tokenValid

        user.password = undefined
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        user.authToken = undefined
        user.idSocket = undefined

        if (!user.idAdmin) {
            user.idAdmin = undefined
        }

        return { user, status: 200 }
    }

    const listUsers = async({ idSocket, token }) => {
        const tokenValid = await validToken(token, idSocket)

        if (!tokenValid.valueOf) { return { error: tokenValid.error, status: 400 } }

        const response = await listUsersOnline()

        if (response.error) { return { error: { msg: "Cannot get users", system: true }, status: 401 } }

        const { users } = response

        users.forEach(user => {
            user.password = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined
            user.idAdmin = undefined
            user.email = undefined
            user.idSocket = undefined
        });

        return { users, status: 200 }
    }

    // Events
    const EUserDisconnect = async({ idSocket }) => {
        const response = await findByIdSocket({ idSocket })

        if (response.error) { return { error: { msg: "User not found", system: true }, status: 400 } }

        const { user } = response

        user.online = false
        user.lastTimeOnline = Date.now()

        await user.save()

        postControl.systemSendPost({ body: `User ${user.username} disconnected`, idServer: user.serverConnected })

        return { status: 200 }
    }

    // DaoUser
    const register = async({ username = "", email = "", password = "", online = false, serverConnected = null, level = 0, xp = 0, xpUpLevel = 0, recordPoints = 0, admin = null, idSocket = null }) => {
        const response = await userDao.register({ username, email, password, online, serverConnected, level, xp, xpUpLevel, recordPoints, admin, idSocket })
        return response
    }

    const findById = async({ _id }) => {
        const response = await userDao.findById({ _id })
        return response
    }

    const findByEmail = async({ email }) => {
        const response = await userDao.findByEmail({ email })
        return response
    }

    const findByIdSocket = async({ idSocket }) => {
        const response = await userDao.findByIdSocket({ idSocket })
        return response
    }

    const findByUsername = async({ username }) => {
        const response = await userDao.findByUsername({ username })
        return response
    }

    const list = async() => {
        const response = await userDao.list()
        return response
    }

    const listUsersOnline = async() => {
        const response = await userDao.listUsersOnline()
        return response
    }

    return {
        userRegister,
        userLogin,
        userLogout,
        userRemove,
        userForgotPassword,
        userResetPassword,
        selectUser,
        queryUser,
        listUsers,
        EUserDisconnect,
        userConnectServer,
    }
}