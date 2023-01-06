import { IId } from "../../database/index.js"
import { Friend, IFriend } from "./model-friend.js"

export default function FriendDao() {
    const register = async ({ users, from, to }: { users: IId[], from: IId, to: IId }) => {
        const response: { invite?: IFriend | null, error?: any } = await Friend.create({ users, from, to }).then(async (res) => {
            await res.populate("users")
            return { invite: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendshipByUsers = async ({ users }: { users: IId[] }) => {
        const response: { friendship?: IFriend | null, error?: any } = await Friend.findOne({ users }).then(async (res) => {
            return { friendship: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendshipByChat = async ({ idChat }: { idChat: IId }) => {
        const response: { friendship?: IFriend | null, error?: any } = await Friend.findOne({ idChat }).then(async (res) => {
            return { friendship: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendshipById = async ({ _id }: { _id: IId }) => {
        const response: { friendship?: IFriend | null, error?: any } = await Friend.findById(_id).then(async (res) => {
            return { friendship: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findFriendsByIdUser = async ({ _id }: { _id: IId }) => {
        const response: { friends?: IFriend[] | null, error?: any } = await Friend.find({ users: _id, pending: false, accepted: true }).then(async (res) => {
            return { friends: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findInvitesPendingOnHold = async ({ _id }: { _id: IId }) => {
        const response: { invites?: IFriend[] | null, error?: any } = await Friend.find({ pending: true, from: _id }).then(async (res) => {
            return { invites: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findInvitesPendingAwaiting = async ({ _id }: { _id: IId }) => {
        const response: { invites?: IFriend[] | null, error?: any } = await Friend.find({ pending: true, to: _id }).then(async (res) => {
            return { invites: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findInvitesDeniedByUser = async ({ _id }: { _id: IId }) => {
        const response: { invites?: IFriend[] | null, error?: any } = await Friend.find({ from: _id, pending: false, accepted: false }).then(async (res) => {
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