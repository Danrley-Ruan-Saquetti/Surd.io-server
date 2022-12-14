import User from "./model-user.js"

export default function UserDao() {
    const register = async({ username = "", email = "", password = "", online = false, idServerConnected = null, level = 0, xp = 0, xpUpLevel = 0, recordPoints = 0, admin = null }) => {
        const response = await User.create({ username, email, password, online, level, xp, xpUpLevel, recordPoints, idServerConnected, admin }).then(async(res) => {
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

    const findById = async({ _id }) => {
        const response = await User.findById(_id).then(async(res) => {
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
        findById,
        findByEmail,
        findByUsername,
    }
}