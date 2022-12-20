import User from "./model-user.js"

export default function UserDao() {
    const register = async({ username = "", email = "", password = "", online = false, serverConnected = null, level = 0, xp = 0, xpUpLevel = 0, recordPoints = 0, admin = null, idSocket = null }) => {
        const response = await User.create({ username, email, password, online, level, xp, xpUpLevel, recordPoints, serverConnected, admin, idSocket }).then(async(res) => {
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const list = async() => {
        const response = await User.find().then(async(res) => {
            return { users: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const listUsersOnline = async() => {
        const response = await User.find({ online: true }).then(async(res) => {
            return { users: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findById = async({ _id }) => {
        const response = await User.findById(_id).then(async(res) => {
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByIdSocket = async({ idSocket }) => {
        const response = await User.findOne({ idSocket }).then(async(res) => {
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByEmail = async({ email }) => {
        const response = await User.findOne({ email }).then(async(res) => {
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByUsername = async({ username }) => {
        const response = await User.findOne({ username }).then(async(res) => {
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
    }
}