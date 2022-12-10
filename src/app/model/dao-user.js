import User from "./model-user.js"

export default function UserDao() {

    const register = async({ username = "", email = "", password = "", online = false, idServerConnected = null, level = 0, xp = 0, xpUpLevel = 0, recordPoints = 0 }) => {
        const response = await User.create({ username, email, password, online, level, xp, xpUpLevel, recordPoints }).then(async(res) => {
            // await res.populate("Server")
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findById = async({ _id }, { select = "" }) => {
        const response = select ? await User.findById(_id).select(select).then(async(res) => {
            // await res.populate("Server")
            return { user: res }
        }).catch(res => {
            return { error: res }
        }) : await User.findById(_id).then(async(res) => {
            // await res.populate("Server")
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByEmail = async({ email }, { select = "" }) => {
        if (select) {
            const response = await User.findOne({ email }).select(`${select}`).then(async(res) => {
                // await res.populate("Server")
                return { user: res }
            }).catch(res => {
                return { error: res }
            })
            return response
        }
        const response = await User.findOne({ email }).then(async(res) => {
            // await res.populate("Server")
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByUsername = async({ username }, { select = "" }) => {
        const response = select ? await User.findOne({ username }).select(select).then(async(res) => {
            // await res.populate("Server")
            return { user: res }
        }).catch(res => {
            return { error: res }
        }) : await User.findOne({ username }).select(select).then(async(res) => {
            // await res.populate("Server")
            return { user: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    return {
        register,
        findById,
        findByEmail,
        findByUsername
    }
}