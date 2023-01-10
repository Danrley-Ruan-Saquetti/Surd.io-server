import bcryptjs from "bcryptjs"
import crypto from "crypto"
import UserDao from "../model/dao-user.js"
import FriendDao from "../model/dao-friend.js"
import { IFriend } from "../model/model-friend.js"
import { IUser } from "../model/model-user.js"
import ServerControl from "./control-server.js"
import AdminControl from "./control-admin.js"
import PostControl from "./control-post.js"
import { RULES_USER } from "../business-rule/rules.js"
import { generatedToken, validToken } from "../util/token.service.js"
import { getSocket, ioEmit, socketJoinRoom, socketLeaveRoom } from "../io/io.js"
import { IId } from "../../database/index.js"
import GameControl from "./control-game.js"

export default function UserControl() {
    const userDao = UserDao()
    const friendDao = FriendDao()
    const serverControl = ServerControl()
    const adminControl = AdminControl()
    const postControl = PostControl()
    const gameControl = GameControl()

    const verifyValuesAlreadyExists = async ({ username, email, _id = "" }: { username: String, email: String, _id?: String }) => {
        const error: { username?: { msg: String, username: Boolean }, email?: { msg: String, email: Boolean } } = {}

        const { user: userUsername } = await findByUsername({ username })

        if (userUsername) {
            if (_id) {
                if (_id != userUsername._id) {
                    error.username = { msg: "Username already exist", username: true }
                }
            } else {
                error.username = { msg: "Username already exist", username: true }
            }
        }

        const { user: userEmail } = await findByEmail({ email })

        if (userEmail) {
            if (_id) {
                if (_id && _id != userEmail._id) {
                    error.email = { msg: "E-mail already exist", email: true }
                }
            } else {
                error.email = { msg: "E-mail already exist", email: true }
            }
        }

        return { error, valueOf: Object.keys(error).length == 0 }
    }

    const validAuthentication = async ({ login, password }: { login: String, password: String }) => {
        const responseEmail = await findByEmail({ email: login })

        let { user } = responseEmail

        if (!user) {
            const responseUsername = await findByUsername({ username: login })

            user = responseUsername.user
        }

        if (!user) { return { error: { msg: "User not found", login: true }, valueOf: false } }

        if (!await bcryptjs.compare(`${password}`, `${user.password}`)) { return { error: { msg: "Password incorrect", password: true }, valueOf: false } }

        return { user, error: [], valueOf: true }
    }

    const connectServer = async ({ _id, user }: { _id: IId, user: IUser }) => {
        const responseServer = await serverControl.findById({ _id })

        if (!responseServer.server) { return { error: { msg: "Cannot connect server, try again", system: true }, status: 401 } }

        if (user.serverConnected) {
            const responseOldServer = await serverControl.findById({ _id: user.serverConnected })

            if (responseOldServer.server) {
                const { server } = responseOldServer

                //@ts-expect-error
                server.playersOnline--

                await server.save()

                const response = await postControl.systemSendPost({ body: "User " + user.username + (!server.isLobby ? " leave" : " enter " + responseServer.server.name), idServer: server._id })

                ioEmit({ ev: `$/users/disconnected`, data: { msg: `User ${user.username} leave` }, room: `${server._id}` })
            }
        }

        const { server } = responseServer

        //@ts-expect-error
        user.serverConnected = server

        await user.save()

        const { idSocket } = user

        //@ts-expect-error
        user.password = undefined
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        user.idSocket = undefined
        user.lastToken = undefined

        if (!user.idAdmin) {
            user.idAdmin = undefined
        }

        //@ts-expect-error
        server.playersOnline++

        await server.save()

        const responseSocket = await getSocket(idSocket || "")

        responseSocket.valueOf && await socketJoinRoom({ idSocket: idSocket || "", keyRoom: server._id })

        responseSocket.valueOf && responseSocket.socket.emit("$/users/current/update/serverConnected", { msg: "User enter server", user })

        const responseNotify = await postControl.systemSendPost({ body: `User ${user.username} connected`, idServer: server._id })

        ioEmit({ ev: `$/users/connected`, data: { msg: `User ${user.username} connected` }, room: `${server._id}` })

        console.log(`[IO] User => {${user._id}} Host => {${idSocket}} connect room {${server._id}}`);

        return { success: { msg: "User connected server successfully", system: true }, status: 200, user }
    }

    const userConnectServer = async ({ _id, token, idSocket }: { _id: IId, token: String, idSocket: String }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.user) { return authValid }

        const { user } = authValid

        if (user.idSocket != idSocket) { return { error: { msg: "Host not connected", system: true }, status: 401, user: null } }

        const responseConnectServer = await connectServer({ _id, user })

        if (responseConnectServer.error) { return { ...responseConnectServer, user: null } }

        const responseFriends = await friendDao.findFriendsByIdUser({ _id: user._id })

        if (responseFriends.friends) {
            const emit = { ev: "$/friends/enter-server", data: { msg: `User ${user.username} enter server` } }

            for (let i = 0; i < responseFriends.friends.length; i++) {
                const friend = responseFriends.friends[i]

                const responseUser = friend.users[0] != user._id ? await findById({ _id: friend.users[0] }) : await findById({ _id: friend.users[0] })

                if (!responseUser.user || !responseUser.user.online) { continue }

                const responseSocket = await getSocket(responseUser.user?.idSocket || "")

                responseSocket.valueOf && responseSocket.socket.emit(emit.ev, emit.data)
            }
        }

        return { user, success: { msg: "Server connected successfully", system: true }, status: 200 }
    }

    const userConnected = async ({ user, idSocket, msg, action }: { user: IUser, idSocket: String, msg: String, action: String }) => {
        const responseLobby = await serverControl.findLobby()

        if (!responseLobby.server) { return { error: { msg: "Cannot connect lobby, try again", system: true }, status: 401 } }

        const { server } = responseLobby

        const token = generatedToken({ _id: user._id, admin: !(!user.idAdmin) })

        user.authToken = token
        user.lastToken = token
        user.online = true
        user.idSocket = idSocket
        user.lastTimeOnline = new Date(Date.now())

        await user.save()

        const responseConnectServer = await connectServer({ _id: server._id, user })

        if (responseConnectServer.error) { return responseConnectServer }

        const responseFriends = await friendDao.findFriendsByIdUser({ _id: user._id })

        if (responseFriends.friends) {
            const emit = { ev: "$/friends/connected", data: { msg: `User ${user.username} connected` } }

            for (let i = 0; i < responseFriends.friends.length; i++) {
                const friend = responseFriends.friends[i]

                const responseUser = friend.users[0] != user._id ? await findById({ _id: friend.users[0] }) : await findById({ _id: friend.users[0] })

                if (!responseUser.user || !responseUser.user.online) { continue }

                const responseSocket = await getSocket(responseUser.user?.idSocket || "")

                responseSocket.valueOf && responseSocket.socket.emit(emit.ev, emit.data)
            }
        }

        console.log(`[IO] User => {${user._id}} Host => {${idSocket}} ${action}`);

        return { user: responseConnectServer.user, success: { msg, system: true }, status: 200 }
    }

    // Use Cases
    const userRegister = async ({ username = "", email = "", password = "", isAdmin = false, tokenAdmin = "", idSocket }: { username: String, email: String, password: String, isAdmin?: Boolean, tokenAdmin?: String, idSocket: String }) => {
        const responseSocket = await findByIdSocket({ idSocket })

        if (responseSocket.user) { return { error: { msg: "Host already connected", system: true }, status: 401 } }

        const valuesVerified = RULES_USER.VALID_REGISTER({ username, email, password })

        if (!valuesVerified.valueOf) { return { error: valuesVerified.error, status: 400 } }

        const valuesAlreadyExistsVerified = await verifyValuesAlreadyExists({ email, username })

        if (!valuesAlreadyExistsVerified.valueOf) { return { error: valuesAlreadyExistsVerified.error, status: 400 } }

        const passwordHash = await bcryptjs.hash(`${password}`, 5).then(res => { return res })

        const response = await register({ username, email, password: passwordHash })

        if (!response.user) { return { error: { msg: "Cannot register user", system: true }, status: 400 } }

        const { user } = response

        if (isAdmin) {
            const responseAdmin = await adminControl.createAdmin({ user, idSocket, tokenAdmin })

            if (!responseAdmin.admin) {
                await user.remove()

                return responseAdmin
            }

            const { admin } = responseAdmin

            user.idAdmin = admin._id

            await user.save()

            console.log(`[IO] Admin => {${user._id}} Host => {${idSocket}} registered`);

            return { success: { msg: "Admin created successfully", system: true }, status: 200 }
        } else {
            const responseUserConnect = await userConnected({ user, idSocket, msg: "User created successfully", action: "registered" })

            return responseUserConnect
        }
    }

    const userLogin = async ({ login = "", password = "", idSocket }: { login: String, password: String, idSocket: String }) => {
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

        const validAuth = await validAuthentication({ login, password })

        if (!validAuth.user) { return { error: validAuth.error, status: 401 } }

        const { user } = validAuth

        if (user.online) { return { error: { msg: "User already logged in this moment", system: true }, status: 401 } }

        const responseUserConnect = await userConnected({ user, idSocket, msg: "User logged successfully", action: "logged" })

        return responseUserConnect
    }

    const userReconnect = async ({ _id, idSocket, token: t }: { _id: IId, idSocket: String, token: String }) => {
        const responseUser = await findById({ _id })

        if (!responseUser.user) { return { error: { msg: "User not found", system: true }, status: 401 } }

        const { user } = responseUser

        if (`Bearer ${user.lastToken}` != `${t}`) { return { error: { msg: "Access denied", system: true }, status: 401 } }

        if (user.online) { return { error: { msg: "User already logged in this moment", system: true }, status: 401 } }

        const responseUserConnect = await userConnected({ user, idSocket, msg: "User reconnected successfully", action: "reconnected" })

        return responseUserConnect
    }

    const userLogout = async ({ token, idSocket }: { token: String, idSocket: String }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.user) { return authValid }

        const { user } = authValid

        const { serverConnected } = user

        user.online = false
        user.lastTimeOnline = new Date(Date.now())
        user.serverConnected = null
        user.authToken = null
        user.idSocket = null

        await user.save()

        const responseServer = await serverControl.findById({ _id: serverConnected || null })

        if (responseServer.server) {
            //@ts-expect-error
            responseServer.server.playersOnline--

            await responseServer.server.save()
        }

        await postControl.systemSendPost({ body: `User ${user.username} disconnected`, idServer: user.serverConnected })

        ioEmit({ ev: `$/users/disconnected`, data: { msg: `User ${user.username} disconnected` }, room: `${serverConnected}` })

        const responseSocket = await socketLeaveRoom({ idSocket })

        if (!responseSocket.valueOf) { return { error: { msg: "Cannot disconnect room. Please, load page for login", system: true }, status: 401 } }

        const responseFriends = await friendDao.findFriendsByIdUser({ _id: user._id })

        if (responseFriends.friends) {
            const emit = { ev: "$/friends/disconnected", data: { msg: `User ${user.username} disconnected` } }

            for (let i = 0; i < responseFriends.friends.length; i++) {
                const friend = responseFriends.friends[i]

                const responseUser = friend.users[0] != user._id ? await findById({ _id: friend.users[0] }) : await findById({ _id: friend.users[0] })

                if (!responseUser.user || !responseUser.user.online) { continue }

                const responseSocketFriend = await getSocket(responseUser.user?.idSocket || "")

                responseSocketFriend.valueOf && responseSocketFriend.socket.emit(emit.ev, emit.data)
            }
        }

        console.log(`[IO] User => {${user._id}} Host => {${idSocket}} login out`);

        return { success: { msg: "User logged out successfully", system: true }, status: 200 }
    }

    const verifyUserPlaying = async ({ idSocket, token }: { idSocket: String, token: String }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.user) { return authValid }

        const { user } = authValid

        const responseServer = await serverControl.findById({ _id: user?.serverConnected || null })

        if (!responseServer.server) { return { error: { msg: "Cannot connect server, try again", system: true }, status: 401 } }

        const { server } = responseServer

        if (server.isLobby) { return { error: { msg: "User not playing", system: true }, status: 401 } }

        return { success: { msg: "User is playing", system: true }, status: 200 }
    }

    const userRemove = async ({ token, idSocket }: { token: String, idSocket: String }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.user) { return authValid }

        const { user } = authValid

        const responseServer = await serverControl.findById({ _id: user?.serverConnected || null })

        if (responseServer.server) {
            //@ts-expect-error
            responseServer.playersOnline--
            await responseServer.server.save()
        }

        const responseFriends = await friendDao.findFriendsByIdUser({ _id: user._id })

        if (responseFriends.friends) {
            for (let i = 0; i < responseFriends.friends.length; i++) {
                const _id = responseFriends.friends[i].users[responseFriends.friends[i].users[0] != user._id ? 0 : 1]

                const responseFriend = await findById({ _id })

                const responseSocket = responseFriend.user ? await getSocket(responseFriend.user?.idSocket || "") : { valueOf: false }

                await responseFriends.friends[i].remove()

                responseSocket.valueOf && responseSocket.socket.emit("$/friends/remove-friendship", { msg: "User deleted" })
            }
        }

        const { serverConnected } = user

        await user.remove()

        console.log(`[IO] User => {${user._id}} Host => {${idSocket}} deleted user`);

        ioEmit({ ev: `$/users/disconnected`, data: { msg: `User ${user.username} disconnected` }, room: `${serverConnected}` })

        return { success: { msg: "User removed successfully", system: true }, status: 200 }
    }

    const userForgotPassword = async ({ email }: { email: String }) => {
        const response = await findByEmail({ email })

        if (!response.user) { return { error: { msg: "User not found", email: true }, status: 400 } }

        const { user } = response

        const token = crypto.randomBytes(20).toString("hex")

        const now = new Date()
        now.setHours(now.getHours() + 1)

        user.passwordResetToken = token
        user.passwordResetExpires = now

        await user.save()

        return { status: 200, success: { msg: "Check your e-mail for reset password", system: true }, token }
    }

    const userResetPassword = async ({ email, password, token }: { email: String, password: String, token: String }) => {
        const response = await findByEmail({ email })

        if (!response.user) { return { error: { msg: "User not found", email: true }, status: 400 } }

        const { user } = response

        if (token != user.passwordResetToken) { return { error: { msg: "Token invalid", system: true }, status: 400 } }

        if (user.passwordResetExpires && new Date() > user.passwordResetExpires) { return { error: { msg: "TokToken expired, generated a new one", system: true }, status: 400 } }

        user.password = await bcryptjs.hash(`${password}`, 5).then(res => { return res })

        await user.save()

        return { success: { msg: "Reset password successfully", system: true }, status: 200 }
    }

    const queryUser = async ({ username = "", token, idSocket }: { username: String, token: String, idSocket: String }) => {
        const tokenValid = await validToken(token, idSocket)

        if (!tokenValid.valueOf) { return { error: tokenValid.error, status: 400 } }

        const response = await findByUsername({ username })

        if (!response.user) { return { error: { msg: "User not found", username: true }, status: 400 } }

        const { user } = response

        //@ts-expect-error
        user.password = undefined
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        user.authToken = undefined
        user.idSocket = undefined
        //@ts-expect-error
        user.email = undefined
        user.lastToken = undefined

        return { user, status: 200 }
    }

    const selectUser = async ({ idSocket, token }: { idSocket: String, token: String }) => {
        const tokenValid = await validToken(token, idSocket)

        if (!tokenValid.user) { return { error: tokenValid.error, status: 400 } }

        const { user } = tokenValid

        //@ts-expect-error
        user.password = undefined
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        user.authToken = undefined
        user.idSocket = undefined
        user.lastToken = undefined

        if (!user.idAdmin) {
            user.idAdmin = undefined
        }

        return { user, status: 200 }
    }

    const listUsers = async ({ idSocket, token }: { idSocket: String, token: String }) => {
        const tokenValid = await validToken(token, idSocket)

        if (!tokenValid.valueOf) { return { error: tokenValid.error, status: 400 } }

        const { user } = tokenValid

        const responseServer = await serverControl.findById({ _id: user?.serverConnected || null })

        const response = responseServer.server ? !responseServer.server.isLobby ? await findUsersByServer({ server: user?.serverConnected || null }) : await findUsersOnline() : { error: {} }

        if (!response.users) { return { error: { msg: "Cannot get users", system: true }, status: 401 } }

        const { users: us } = response

        const users = []

        for (let i = 0; i < us.length; i++) {
            const u = us[i]

            let responseFriendship: { error?: any, friendship?: IFriend | null | undefined }

            let j = 0
            do {
                responseFriendship = j == 0 ? await friendDao.findFriendshipByUsers({ users: [user?._id || null, u._id] }) : await friendDao.findFriendshipByUsers({ users: [u._id, user?._id || null] })
                j++
            } while (j < 2 && !responseFriendship.friendship);

            const friend = {
                isInvited: !(!responseFriendship.friendship),
                isPending: responseFriendship.friendship ? responseFriendship.friendship.pending : null,
                isFriend: responseFriendship.friendship ? responseFriendship.friendship.accepted : null,
                to: responseFriendship.friendship ? responseFriendship.friendship.to : null,
                from: responseFriendship.friendship ? responseFriendship.friendship.from : null,
                _id: responseFriendship.friendship && responseFriendship.friendship._id
            }

            const responseServer = await serverControl.findById({ _id: u?.serverConnected || null })

            const _user = {
                username: u.username,
                _id: u._id,
                level: u.level,
                xp: u.xp,
                xpUpLevel: u.xpUpLevel,
                serverConnected: responseServer.server ? responseServer.server : { _id: u.serverConnected },
                __v: u.__v,
                recordPoints: u.recordPoints,
                lastTimeOnline: u.lastTimeOnline,
                createAt: u.createAt,
                friend
            }

            users.push(_user)
        }

        return { users, status: 200 }
    }

    const listUsersOnline = async ({ idSocket, token }: { idSocket: String, token: String }) => {
        const tokenValid = await validToken(token, idSocket)

        if (!tokenValid.valueOf) { return { error: tokenValid.error, status: 400 } }

        const { user } = tokenValid

        const response = await findUsersOnline()

        if (!response.users) { return { error: { msg: "Cannot get users", system: true }, status: 401 } }

        const { users: us } = response

        const users = []

        for (let i = 0; i < us.length; i++) {
            const u = us[i]

            const responseFriendship = await friendDao.findFriendshipByUsers({ users: [user?._id || null, u._id] })

            const friend = {
                isInvited: !responseFriendship.error,
                isPending: responseFriendship.friendship ? responseFriendship.friendship.pending : null,
                isFriend: responseFriendship.friendship ? responseFriendship.friendship.accepted : null,
                to: responseFriendship.friendship ? responseFriendship.friendship.to : null,
                from: responseFriendship.friendship ? responseFriendship.friendship.from : null
            }

            const _user = {
                username: u.username,
                _id: u._id,
                level: u.level,
                xp: u.xp,
                xpUpLevel: u.xpUpLevel,
                serverConnected: u.serverConnected,
                __v: u.__v,
                recordPoints: u.recordPoints,
                lastTimeOnline: u.lastTimeOnline,
                createAt: u.createAt,
                friend
            }

            users.push(_user)
        }

        return { users, status: 200 }
    }

    // Events
    const EUserConnect = async (idSocket: String) => {
        console.log(`[IO] Host => {${idSocket}} connected`);
    }

    const EUserDisconnect = async ({ idSocket }: { idSocket: String }) => {
        const response = await findByIdSocket({ idSocket })

        !response.user && console.log(`[IO] Host => {${idSocket}} disconnected`);

        if (!response.user) { return { status: 401 } }

        const { user } = response

        const { serverConnected } = user

        user.online = false
        user.lastTimeOnline = new Date(Date.now())
        user.serverConnected = null
        user.authToken = null
        user.idSocket = null

        await user.save()

        const responseServer = await serverControl.findById({ _id: serverConnected || null })

        if (responseServer.server) {
            //@ts-expect-error
            responseServer.server.playersOnline--
            await responseServer.server.save()

            if (!responseServer.server.isLobby) {
                const responseGame = gameControl.UserQuitGame({ idSocket, idServer: serverConnected || null })
            }
        }

        await postControl.systemSendPost({ body: `User ${user.username} disconnected`, idServer: serverConnected || null })

        ioEmit({ ev: `$/users/disconnected`, data: { msg: `User ${user.username} disconnected` }, room: `${serverConnected}` })

        const responseFriends = await friendDao.findFriendsByIdUser({ _id: user._id })

        if (responseFriends.friends) {
            const emit = { ev: "$/friends/disconnected", data: { msg: `User ${user.username} disconnected` } }

            for (let i = 0; i < responseFriends.friends.length; i++) {
                const friend = responseFriends.friends[i]

                const responseUser = friend.users[0] != user._id ? await findById({ _id: friend.users[0] }) : await findById({ _id: friend.users[0] })

                if (!responseUser.user || !responseUser.user.online) { continue }

                const responseSocketFriend = await getSocket(responseUser.user?.idSocket || "")

                responseSocketFriend.valueOf && responseSocketFriend.socket.emit(emit.ev, emit.data)
            }
        }

        console.log(`[IO] User => {${user._id}} Host => {${idSocket}} disconnected`);

        return { status: 200 }
    }

    const EUserStartGame = async ({ _id, idSocket, token }: { _id: IId, idSocket: String, token: String }) => {
        const responseConnectServer = await userConnectServer({ _id, idSocket, token })

        if (!responseConnectServer.valueOf || !responseConnectServer.user) { return responseConnectServer }

        const { user } = responseConnectServer

        user.idSocket = idSocket

        const responseGame = gameControl.UserStartGame({ user, idServer: _id })

        if (!responseGame.valueOf) { return { error: { msg: "Cannot connect server", system: true }, valueOf: false, status: 401 } }

        const responseSocket = await getSocket(idSocket)

        const data = await gameControl.getData({ idSocket, token })

        responseSocket.socket && responseSocket.socket.emit("$/games/players/current/data", data)

        return responseConnectServer
    }

    const EUserQuitGame = async ({ idSocket, token }: { idSocket: String, token: String }) => {
        const responseLobby = await serverControl.findLobby()

        if (!responseLobby.server) { return { error: { msg: "Lobby not found", system: true }, status: 404 } }

        const responseUser = await findByIdSocket({ idSocket })

        if (!responseUser.user) { return { error: { msg: "Cannot disconnect server", system: true }, status: 404 } }

        const { serverConnected } = responseUser.user

        const responseConnectServer = await userConnectServer({ _id: responseLobby.server._id, idSocket, token })

        if (!responseConnectServer.valueOf || !responseConnectServer.user) { return responseConnectServer }

        const { user } = responseConnectServer

        const responseGame = gameControl.UserQuitGame({ idSocket, idServer: serverConnected || null })

        if (!responseGame.valueOf) { return { error: { msg: "Cannot disconnect server", system: true }, valueOf: false, status: 401 } }

        return responseConnectServer
    }

    // DaoUser
    const register = async ({ username = "", email = "", password = "", online = false, serverConnected = null, level = 1, xp = 0, xpUpLevel = 0, recordPoints = 0, admin = null, idSocket = "", coins = 0 }: { username: String, email: String, password: String, online?: Boolean, serverConnected?: IId, level?: Number, xp?: Number, xpUpLevel?: Number, recordPoints?: Number, admin?: IId, idSocket?: String, coins?: Number }) => {
        const response = await userDao.register({ username, email, password, online, serverConnected, level, xp, xpUpLevel, recordPoints, admin, idSocket, coins })
        return response
    }

    const findById = async ({ _id }: { _id: IId }) => {
        const response = await userDao.findById({ _id })
        return response
    }

    const findByEmail = async ({ email }: { email: String }) => {
        const response = await userDao.findByEmail({ email })
        return response
    }

    const findByIdSocket = async ({ idSocket }: { idSocket: String }) => {
        const response = await userDao.findByIdSocket({ idSocket })
        return response
    }

    const findByUsername = async ({ username }: { username: String }) => {
        const response = await userDao.findByUsername({ username })
        return response
    }

    const findUsersByServer = async ({ server }: { server: IId }) => {
        const response = await userDao.listUsersByServer({ server })
        return response
    }

    const findUsersOnline = async () => {
        const response = await userDao.listUsersOnline()
        return response
    }

    return {
        userRegister,
        userLogin,
        userReconnect,
        userLogout,
        verifyUserPlaying,
        userRemove,
        userForgotPassword,
        userResetPassword,
        selectUser,
        queryUser,
        listUsers,
        listUsersOnline,
        EUserDisconnect,
        EUserConnect,
        EUserStartGame,
        EUserQuitGame,
    }
}