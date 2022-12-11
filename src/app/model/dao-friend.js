import Friend from "./model-friend.js"

export default function FriendDao() {
    const register = async({ users }) => {
        const response = await Friend.create({ users }).then(async(res) => {
            await res.populate("users")
            return { friend: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const list = async() => {
        const response = await Friend.find().then(async(res) => {
            return { friends: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendly = async({ users }) => {
        const response = await Friend.findOne({ users }).then(async(res) => {
            return { friend: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendlyById = async({ _id }) => {
        const response = await Friend.findById(_id).then(async(res) => {
            return { friend: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByUser = async({ _id }) => {
        const response = await Friend.find({ users: _id }).then(async(res) => {
            return { friends: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendsPending = async({ _id }) => {
        const response = await Friend.find({ users: _id, pending: true }).then(async(res) => {
            return { friends: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendsByUser = async({ _id }) => {
        const response = await Friend.find({ users: _id, pending: false, accepted: true }).then(async(res) => {
            return { friends: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendsDeniedByUser = async({ _id }) => {
        const response = await Friend.find({ users: _id, pending: false, accepted: false }).then(async(res) => {
            return { friends: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    return {
        register,
        list,
        findByUser,
        findFriendsPending,
        findFriendsByUser,
        findFriendsDeniedByUser,
        findFriendly,
        findFriendlyById,
    }
}