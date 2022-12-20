import ServerDao from "../model/dao-server.js"
import ChatDao from "../model/dao-chat.js"
import UserDao from "../model/dao-user.js"
import PostDao from "../model/dao-post.js"

const serverDao = ServerDao()
const chatDao = ChatDao()
const userDao = UserDao()
const postDao = PostDao()

export default async function Data() {
    const servers = [{ name: "Server A", lobby: false }, { name: "Server B", lobby: false }, { name: "Server C", lobby: false }, { name: "Server D", lobby: false }, { name: "Server E", lobby: false }, { name: "Lobby", lobby: true }]

    const serverData = () => {
        servers.forEach(async(s) => {
            const responseServer = await serverDao.findByName(s)

            if (responseServer.server) { return }

            const responseRegisterServer = await serverDao.register(s)

            const responseRegisterChat = await chatDao.register({ idServer: responseRegisterServer.server._id })
        })
    }

    const userData = async() => {
        const { users } = await userDao.list().then(res => {
            res.users.forEach(user => {
                user.online = false
                user.authToken = null
                user.idServerConnected = null
                user.idSocket = null

                user.save()
            })

            return res
        }).catch(err => console.log(err))
    }

    const postData = async() => {
        const response = await postDao.list()

        response.posts.forEach((post) => {
            post.remove()
        })
    }

    serverData()
    userData()
        // postData()
}