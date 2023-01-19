import { io } from "./io.js"
import UserControl from "../controller/control-user.js"
import ServerControl from "../controller/control-server.js"
import ChatControl from "../controller/control-chat.js"
import PostControl from "../controller/control-post.js"
import FriendControl from "../controller/control-friend.js"
import AdminControl from "../controller/control-admin.js"
import GameControl from "../controller/control-game.js"

const userControl = UserControl()
const serverControl = ServerControl()
const chatControl = ChatControl()
const postControl = PostControl()
const friendControl = FriendControl()
const adminControl = AdminControl()
const gameControl = GameControl()

io.on("connection", async (socket) => {
    const idSocket = socket.id

    await userControl.EUserConnect(idSocket)

    const socketEmit = ({ ev = "", data = {} }: { ev: String, data: any }) => {
        socket.emit(`${ev}`, data)
    }

    socket.on("disconnect", async () => {
        try {
            const response = await userControl.EUserDisconnect({ idSocket })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }
        } catch (err) {
            console.log(err);
        }
    })

    // Auth
    socket.on("auth/register", async (req) => {
        try {
            const { username, email, password, isAdmin, authToken } = req

            const response = await userControl.userRegister({ idSocket, username, email, password, isAdmin, tokenAdmin: authToken })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "auth/register/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "auth/register/res", data: { error: { msg: "Cannot register user", system: true } } })
        }
    })

    socket.on("auth/login", async (req) => {
        try {
            const { login, password } = req

            const response = await userControl.userLogin({ idSocket, login, password })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "auth/login/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "auth/login/res", data: { error: { msg: "Cannot login user", system: true } } })
        }
    })

    socket.on("auth/login/reconnect", async (req) => {
        try {
            const { _id, authToken } = req

            const response = await userControl.userReconnect({ idSocket, _id, token: authToken })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "auth/login/reconnect/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "auth/login/reconnect/res", data: { error: { msg: "Cannot login user", system: true } } })
        }
    })

    socket.on("auth/logout", async (req) => {
        try {
            const { authToken } = req

            const response = await userControl.userLogout({ idSocket, token: authToken })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "auth/logout/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "auth/logout/res", data: { error: { msg: "Cannot logout user", system: true } } })
        }
    })

    // User
    socket.on("users", async (req) => {
        try {
            const { authToken } = req

            const response = await userControl.listUsers({ token: authToken, idSocket })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "users/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/res", data: { error: { msg: "Cannot get users", system: true } } })
        }
    })

    socket.on("users/connected", async (req) => {
        try {
            const { authToken } = req

            const response = await userControl.listUsersOnline({ token: authToken, idSocket })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "users/connected/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/connected/res", data: { error: { msg: "Cannot get users", system: true } } })
        }
    })

    socket.on("users/select", async (req) => {
        try {
            const { authToken } = req

            const response = await userControl.selectUser({ token: authToken, idSocket })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "users/select/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/select/res", data: { error: { msg: "Cannot select user", system: true } } })
        }
    })

    socket.on("users/query", async (req) => {
        try {
            const { authToken, username } = req

            const response = await userControl.queryUser({ token: authToken, idSocket, username })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "users/query/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/query/res", data: { error: { msg: "Cannot query user", system: true } } })
        }
    })

    socket.on("users/remove", async (req) => {
        try {
            const { authToken } = req

            const response = await userControl.userRemove({ idSocket, token: authToken })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "users/remove/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/remove/res", data: { error: { msg: "Cannot remove user", system: true } } })
        }
    })

    socket.on("users/forgot-password", async (req) => {
        try {
            const { email } = req

            const response = await userControl.userForgotPassword({ email })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "users/forgot-password/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/forgot-password/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })

    socket.on("users/reset-password", async (req) => {
        try {
            const { authToken, email, password } = req

            const response = await userControl.userResetPassword({ email, password, token: authToken })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "users/reset-password/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/reset-password/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })

    socket.on("users/verify-is-playing", async (req) => {
        try {
            const { authToken } = req

            const response = await userControl.verifyUserPlaying({ idSocket, token: authToken })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "users/verify-is-playing/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "users/verify-is-playing/res", data: { error: { msg: "Cannot verify user is playing", system: true } } })
        }
    })

    // Post
    socket.on("chat", async (req) => {
        try {
            const { authToken } = req

            const response = await postControl.listPosts({ idSocket, token: authToken })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "chat/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "chat/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })

    socket.on("chat/private", async (req) => {
        try {
            const { authToken, idChat } = req

            const response = await postControl.listPosts({ idChat, idSocket, token: authToken })

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "chat/private/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "chat/private/res", data: { error: { msg: "Cannot operation reset password", system: true } } })
        }
    })

    socket.on("chat/send-post", async (req) => {
        try {
            const { body, authToken } = req

            const response = await postControl.userSendPost({ idSocket, token: authToken, body })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "chat/send-post/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "chat/send-post/res", data: { error: { msg: "Cannot send post", system: true } } })
        }
    })

    socket.on("chat/private/send-post", async (req) => {
        try {
            const { body, authToken, idChat } = req

            const response = await postControl.userSendPost({ idSocket, token: authToken, body, idChat })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "chat/private/send-post/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "chat/private/send-post/res", data: { error: { msg: "Cannot send post", system: true } } })
        }
    })

    // Friend
    socket.on("friends", async (req) => {
        try {
            const { authToken } = req

            const response = await friendControl.listFriendsById({ idSocket, token: authToken })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "friends/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/res", data: { error: { msg: "Cannot get friends", system: true } } })
        }
    })

    socket.on("friends/send-invite", async (req) => {
        try {
            const { authToken, _id } = req

            const response = await friendControl.sendInviteFriendship({ to: _id, idSocket, token: authToken })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "friends/send-invite/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/send-invite/res", data: { error: { msg: "Cannot send invite", system: true } } })
        }
    })

    socket.on("friends/accept-invite", async (req) => {
        try {
            const { authToken, _id } = req

            const response = await friendControl.acceptInviteFriendship({ idSocket, token: authToken, _id })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "friends/accept-invite/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/accept-invite/res", data: { error: { msg: "Cannot accept invite", system: true } } })
        }
    })

    socket.on("friends/denied-invite", async (req) => {
        try {
            const { authToken, _id } = req

            const response = await friendControl.deniedInviteFriendship({ idSocket, token: authToken, _id })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "friends/denied-invite/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/denied-invite/res", data: { error: { msg: "Cannot denied invite", system: true } } })
        }
    })

    socket.on("friends/cancel-invite", async (req) => {
        try {
            const { authToken, _id } = req

            const response = await friendControl.cancelInvite({ idSocket, token: authToken, _id })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "friends/cancel-invite/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/cancel-invite/res", data: { error: { msg: "Cannot cancel invite", system: true } } })
        }
    })

    socket.on("friends/remove-friendship", async (req) => {
        try {
            const { authToken, _id } = req

            const response = await friendControl.removeFriendship({ idSocket, token: authToken, _id })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "friends/remove-friendship/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/remove-friendship/res", data: { error: { msg: "Cannot remove friendship", system: true } } })
        }
    })

    socket.on("friends/pending/on-hold", async (req) => {
        try {
            const { authToken } = req

            const response = await friendControl.listInvitesPendingOnHold({ idSocket, token: authToken })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "friends/pending/on-hold/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/pending/on-hold/res", data: { error: { msg: "Cannot get invites", system: true } } })
        }
    })

    socket.on("friends/pending/awaiting", async (req) => {
        try {
            const { authToken } = req

            const response = await friendControl.listInvitesPendingAwaiting({ idSocket, token: authToken })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "friends/pending/awaiting/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/pending/awaiting/res", data: { error: { msg: "Cannot get invites", system: true } } })
        }
    })

    socket.on("friends/denied", async (req) => {
        try {
            const { authToken } = req

            const response = await friendControl.listInvitesDeniedByUser({ idSocket, token: authToken })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "friends/denied/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "friends/denied/res", data: { error: { msg: "Cannot get invites denied", system: true } } })
        }
    })

    // Server
    socket.on("servers", async (req) => {
        try {
            const { authToken } = req

            const response = await serverControl.listServers({ idSocket, token: authToken })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "servers/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "servers/res", data: { error: { msg: "Cannot get invites denied", system: true } } })
        }
    })

    // Game
    socket.on("games/start", async (req) => {
        try {
            const { idServer, authToken } = req

            const response = await userControl.EUserStartGame({ _id: idServer, idSocket, token: authToken })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "games/start/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "games/start/res", data: { error: { msg: "Cannot connect server, try again", system: true } } })
        }
    })

    socket.on("games/quit", async (req) => {
        try {
            const { authToken } = req

            const response = await userControl.EUserQuitGame({ idSocket, token: authToken })

            const { status } = response

            if (response.valueOf) {
                //@ts-expect-error
                response.valueOf = undefined
            }
            if (response.status) {
                //@ts-expect-error
                response.status = undefined
            }

            socketEmit({ ev: "games/quit/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "games/quit/res", data: { error: { msg: "Cannot get invites denied", system: true } } })
        }
    })

    socket.on("games/data", async (req) => {
        try {
            const { authToken } = req

            const response = await gameControl.getData({ idSocket, token: authToken })

            socketEmit({ ev: "games/data/res", data: response })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "games/data/res", data: { error: { msg: "Cannot get data game", system: true } } })
        }
    })

    socket.on("games/players/move", async (req) => {
        try {
            const { data, idServer } = req

            gameControl.movePlayer({ idSocket, idServer, data })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "games/players/move/res", data: { error: { msg: "Cannot move player", system: true } } })
        }
    })

    socket.on("games/players/shoot-projectile", async (req) => {
        try {
            const { data, idServer } = req

            gameControl.shootProjectile({idSocket, idServer, data})
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "games/players/move/res", data: { error: { msg: "Cannot move player", system: true } } })
        }
    })

    socket.on("games/players/power-ups/upgrade", async (req) => {
        try {
            const { data, idServer } = req

            gameControl.upgradePU({ idSocket, idServer, powerUp: data })
        } catch (err) {
            console.log(err);
            socketEmit({ ev: "games/players/move/res", data: { error: { msg: "Cannot upgrade power up", system: true } } })
        }
    })
})