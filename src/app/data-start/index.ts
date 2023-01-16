import ServerDao from "../model/dao-server.js"
import ChatDao from "../model/dao-chat.js"
import UserDao from "../model/dao-user.js"
import PostDao from "../model/dao-post.js"
import dataGame from "../game/data/data-game.js"
import { RULES_GAME, RULES_SERVER } from "../business-rule/rules.js"

const serverDao = ServerDao()
const chatDao = ChatDao()
const userDao = UserDao()
const postDao = PostDao()

export default async function DataStart() {
    const serverData = () => {
        RULES_SERVER.servers.forEach(async (s) => {
            const responseServer = await serverDao.findByName(s)

            if (responseServer.server) {
                responseServer.server.playersOnline = 0
                await responseServer.server.save()
                return
            }

            const responseRegisterServer = await serverDao.register(s)

            const responseRegisterChat = await chatDao.register({ idServer: responseRegisterServer.server?._id || "", isServer: true })
        })
    }

    const userData = async () => {
        const responseUsers = await userDao.list()

        if (responseUsers.users) {
            responseUsers.users.forEach(async (user) => {
                user.online = false
                user.authToken = null
                user.serverConnected = null
                user.idSocket = null

                await user.save()
            })
        }
    }

    const postData = async () => {
        const responseChats = await chatDao.listChatsServer()

        responseChats.chats && (function () {
            responseChats.chats.forEach(async (chat) => {
                const responsePost = await postDao.listByChat({ chat: chat._id, isPrivate: true })

                responsePost.posts && (function () {
                    responsePost.posts.forEach(async (post) => {
                        await post.remove()
                    })
                }())
            })
        }())
    }

    const gameDate = async () => {
        const responseServers = await serverDao.list()

        responseServers.servers && (function () {
            responseServers.servers.forEach(server => {
                dataGame.addGame({ _id: server._id, players: [], xps: [], map: { dimension: RULES_GAME.map.dimension }, potions: [] })
            })
        }())
    }

    const postInfoRestart = async () => {
        const responseServers = await serverDao.listAll()

        responseServers.servers && responseServers.servers.forEach(async (server) => {
            const responseChats = await chatDao.findByServer({ idServer: server._id })

            responseChats.chat && (function () {
                postDao.register({ body: "Server Restarted", chat: responseChats.chat._id, info: true })
            }())
        })
    }

    await serverData()
    await userData()
    await postData()
    await gameDate()
    await postInfoRestart()
}