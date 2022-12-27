import Friend from "./model-friend.js"

export default function FriendDao() {
    const register = async({ users, from, to }) => {
        const response = await Friend.create({ users, from, to }).then(async(res) => {
            await res.populate("users")
            return { invite: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendshipByUsers = async({ users }) => {
        const response = await Friend.findOne({ users }).then(async(res) => {
            return { friendship: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendshipByChat = async({ idChat }) => {
        const response = await Friend.findOne({ idChat }).then(async(res) => {
            return { friendship: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendshipById = async({ _id }) => {
        const response = await Friend.findById(_id).then(async(res) => {
            return { friendship: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendsByIdUser = async({ _id }) => {
        const response = await Friend.find({ users: _id, pending: false, accepted: true }).then(async(res) => {
            return { friends: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findInvitesPendingOnHold = async({ _id }) => {
        const response = await Friend.find({ pending: true, from: _id }).then(async(res) => {
            return { invites: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findInvitesPendingAwaiting = async({ _id }) => {
        const response = await Friend.find({ pending: true, to: _id }).then(async(res) => {
            return { invites: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findInvitesDeniedByUser = async({ _id }) => {
        const response = await Friend.find({ from: _id, pending: false, accepted: false }).then(async(res) => {
            return { invites: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    return {
        register,
        findFriendsByIdUser,
        findFriendshipByUsers,
        findFriendshipById,
        findInvitesPendingOnHold,
        findInvitesPendingAwaiting,
        findInvitesDeniedByUser,
        findFriendshipByChat,
    }
}