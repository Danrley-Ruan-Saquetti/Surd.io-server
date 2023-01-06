import { IId } from "../../database/index.js"
import { IUser, User } from "./model-user.js"

export default function UserDao() {
    const register = async ({ username = "", email = "", password = "", online = false, serverConnected = null, level = 1, xp = 0, xpUpLevel = 0, recordPoints = 0, admin = null, idSocket = "", coins = 0 }: { username: String, email: String, password: String, online?: Boolean, serverConnected?: IId, level?: Number, xp?: Number, xpUpLevel?: Number, recordPoints?: Number, admin?: IId, idSocket?: String, coins?: Number }) => {
        const response: { user?: IUser, error?: any } = await User.create({ username, email, password, online, level, xp, xpUpLevel, recordPoints, serverConnected, admin, idSocket, coins }).then(async (res) => {
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const list = async () => {
        const response: { users?: IUser[] | null, error?: any } = await User.find().then(async (res) => {
            return { users: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const listUsersOnline = async () => {
        const response: { users?: IUser[] | null, error?: any } = await User.find({ online: true }).then(async (res) => {
            return { users: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const listUsersByServer = async ({ server }: { server: IId }) => {
        const response: { users?: IUser[] | null, error?: any } = await User.find({ serverConnected: server, online: true }).then(async (res) => {
            return { users: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findById = async ({ _id }: { _id: IId }) => {
        const response: { user?: IUser | null, error?: any } = await User.findById(_id).then(async (res) => {
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByIdSocket = async ({ idSocket }: { idSocket: String }) => {
        const response: { user?: IUser | null, error?: any } = await User.findOne({ idSocket }).then(async (res) => {
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByEmail = async ({ email }: { email: String }) => {
        const response: { user?: IUser | null, error?: any } = await User.findOne({ email }).then(async (res) => {
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByUsername = async ({ username }: { username: String }) => {
        const response: { user?: IUser | null, error?: any } = await User.findOne({ username }).then(async (res) => {
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    return {
        register,
        list,
        listUsersOnline,
        findById,
        findByEmail,
        findByUsername,
        findByIdSocket,
        listUsersByServer,
    }
}