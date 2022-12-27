import ServerDao from "../model/dao-server.js"
import ChatDao from "../model/dao-chat.js"
import UserDao from "../model/dao-user.js"
import PostDao from "../model/dao-post.js"

const serverDao = ServerDao()
const chatDao = ChatDao()
const userDao = UserDao()
const postDao = PostDao()

export default async function Data() {
    const servers = [{ name: "Server A", isLobby: false }, { name: "Server B", isLobby: false }, { name: "Server C", isLobby: false }, { name: "Server D", isLobby: false }, { name: "Server E", isLobby: false }, { name: "Lobby", isLobby: true }]

    const serverData = () => {
        servers.forEach(async(s) => {
            const responseServer = await serverDao.findByName(s)
            const responseChatServer = responseServer.server ? await chatDao.findByServer({ idServer: responseServer.server._id }) : { error: {} }

            responseServer.server && await responseServer.server.remove()
            responseChatServer.chat && await responseChatServer.chat.remove()

            const responseRegisterServer = await serverDao.register(s)

            const responseRegisterChat = await chatDao.register({ idServer: responseRegisterServer.server._id, isServer: true })
        })
    }

    const userData = async() => {
        const { users } = await userDao.list().then(res => {
            res.users.forEach(async(user) => {
                user.online = false
                user.authToken = null
                user.idServerConnected = null
                user.idSocket = null

                await user.save()
            })

            return res
        }).catch(err => console.log(err))
    }

    const postData = async() => {
        const response = await postDao.list()

        response.posts && response.posts.forEach(async(post) => {
            await post.remove()
        })
    }

    serverData()
    userData()
    postData()

    const responseServers = await serverDao.list()

    responseServers.servers && responseServers.servers.forEach(async(server) => {
        const responseChats = await chatDao.findByServer({ idServer: server._id })

        responseChats.chat && (function() {
            postDao.register({ body: "Server Restarted", chat: responseChats.chat._id, info: true })
        }())
    })
}