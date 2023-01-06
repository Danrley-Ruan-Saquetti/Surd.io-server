import { IId } from "../../database/index.js"
import { Chat, IChat } from "./model-chat.js"

export default function ChatDao() {
    const register = async ({ idServer = null, isServer = false, idFriend = null }: { idServer: IId, isServer: Boolean, idFriend?: IId }) => {
        const response: { chat?: IChat, error?: any } = await Chat.create({ idServer, isServer, idFriend }).then(async (res) => {
            return { chat: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const list = async () => {
        const response: { chats?: IChat[], error?: any } = await Chat.find().then(async (res) => {
            return { chats: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const listChatsServer = async () => {
        const response: { chats?: IChat[], error?: any } = await Chat.find({ isServer: true }).then(async (res) => {
            return { chats: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findById = async ({ _id }: { _id: IId }) => {
        const response: { chat?: IChat | null, error?: any } = await Chat.findById(_id).then(async (res) => {
            return { chat: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByServer = async ({ idServer }: { idServer: IId }) => {
        const response: { chat?: IChat | null, error?: any } = await Chat.findOne({ idServer }).then(async (res) => {
            return { chat: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByFriend = async ({ idFriend }: { idFriend: IId }) => {
        const response: { chat?: IChat | null, error?: any } = await Chat.findOne({ idFriend }).then(async (res) => {
            return { chat: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByUser = async ({ user }: { user: IId }) => {
        const response: { chat?: IChat | null, error?: any } = await Chat.findOne({ users: user }).then(async (res) => {
            return { chat: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByUsers = async ({ users }: { users: IId[] }) => {
        const response: { chat?: IChat | null, error?: any } = await Chat.findOne({ users }).then(async (res) => {
            return { chat: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    return {
        register,
        list,
        listChatsServer,
        findById,
        findByServer,
        findByUser,
        findByUsers,
        findByFriend
    }
}