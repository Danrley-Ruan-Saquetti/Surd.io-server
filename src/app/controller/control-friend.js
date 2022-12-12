import FriendDao from "../model/dao-friend.js"
import UserDao from "../model/dao-user.js"
import { validAuth } from "../util/token.service.js"

export default function FriendControl() {
    const friendDao = FriendDao()
    const userDao = UserDao()

    // Use Cases
    const sendInviteFriendship = async({ users, from, to, token }) => {
        if (from === to) { return { error: { msg: "Cannot send invite friendship to yourself", system: true }, status: 401 } }

        const responseFriendship = await findFriendshipByUsers({ users })

        if (responseFriendship.friend) {
            if (responseFriendship.friend.pending) {
                return { error: { msg: "Invite already send", system: true }, status: 401 }
            }
            if (responseFriendship.friend.accepted) {
                return { error: { msg: "User already friend", system: true }, status: 401 }
            }
        }

        const authValid = await validAuth(token, from)

        if (authValid.error) { return authValid }

        const responseRecipient = await userDao.findById({ _id: to })

        if (!responseRecipient.user) { return { error: { msg: "Recipient not defined", system: true }, status: 400 } }

        const response = await registerFriend({ users, from, to })

        if (response.error) { return { error: { msg: "Cannot send invite friend", system: true }, status: 400 } }

        const { friend } = response

        for (let i = 0; i < friend.users.length; i++) {
            const user = friend.users[i]

            user.password = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined
        }

        responseFriendship.friend && responseFriendship.friend.remove()

        return { friend: { users: friend.users, _id: friend._id }, success: { msg: "Send invite friendship successfully", system: true }, status: 200 }
    }

    const acceptInviteFriendship = async({ _id, recipient, token }) => {
        const authValid = await validAuth(token, recipient)

        if (authValid.error) { return authValid }

        const response = await findFriendshipById({ _id })

        if (!response.friend) { return { error: { msg: "Friendship not found", system: true }, status: 401 } }

        const { friend } = response

        if (!friend.pending) { return { error: { msg: `Friendship already ${friend.accepted ? "accepted" : "denied"}`, system: true }, status: 401 } }

        friend.pending = false
        friend.accepted = true

        friend.save()

        return { success: { msg: "Accept friendship successfully", system: true }, status: 200 }
    }

    const removeFriendship = async({ _id, _idUser, token }) => {
        const authValid = await validAuth(token, _idUser)

        if (authValid.error) { return authValid }

        const response = await findFriendshipById({ _id })

        if (!response.friend) { return { error: { msg: "Friendship not found", system: true }, status: 401 } }

        const { friend } = response

        friend.remove()

        return { success: { msg: "Friendship removed successfully", system: true }, status: 200 }
    }

    const cancelInvite = async({ _id, _idUser, token }) => {
        const authValid = await validAuth(token, _idUser)

        if (authValid.error) { return authValid }

        const response = await findFriendshipById({ _id })

        if (!response.friend) { return { error: { msg: "Friendship not found", system: true }, status: 401 } }

        if (!response.friend.pending) { return { error: { msg: "Cannot cancel invite", system: true }, status: 401 } }

        const { friend } = response

        friend.remove()

        return { success: { msg: "Invite canceled successfully", system: true }, status: 200 }
    }

    const deniedInviteFriendship = async({ _id, recipient, token }) => {
        const authValid = await validAuth(token, recipient)

        if (authValid.error) { return authValid }

        const response = await findFriendshipById({ _id })

        if (response.error) { return { error: { msg: "Friendship not found", system: true }, status: 401 } }

        const { friend } = response

        if (!friend.pending) { return { error: { msg: `Friendship already ${friend.accepted ? "accepted" : "denied"}`, system: true }, status: 401 } }

        friend.pending = false
        friend.accepted = false

        friend.save()

        return { success: { msg: "Denied friendship successfully", system: true }, status: 200 }
    }

    const listFriendsById = async({ _id, token }) => {
        const authValid = await validAuth(token, _id)

        if (authValid.error) { return authValid }

        const response = await findFriendsByIdUser({ _id })

        if (response.error) { return { error: { msg: "Cannot get friends", system: true }, status: 401 } }

        const { friends } = response

        const users = []

        for (let i = 0; i < friends.length; i++) {
            const f = friends[i];

            const { user } = f.users[0] != _id ? await userDao.findById(f.users[0]) : await userDao.findById(f.users[1])

            user.password = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined

            users.push({ _id: f._id, user })
        }

        return { friends: users, status: 200 }
    }

    const listInvitesPendingOnHold = async({ _id, token }) => {
        const authValid = await validAuth(token, _id)

        if (authValid.error) { return authValid }

        const response = await findInvitesPendingOnHold({ _id })

        if (response.error) { return { error: { msg: "Cannot get friends", system: true }, status: 401 } }

        const { friends } = response

        const users = []

        for (let i = 0; i < friends.length; i++) {
            const f = friends[i];

            const { user } = f.users[0] != _id ? await userDao.findById(f.users[0]) : await userDao.findById(f.users[1])

            user.password = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined

            users.push({ _id: f._id, user })
        }

        return { friends: users, status: 200 }
    }

    const listInvitesPendingAwaiting = async({ _id, token }) => {
        const authValid = await validAuth(token, _id)

        if (authValid.error) { return authValid }

        const response = await findInvitesPendingAwaiting({ _id })

        if (response.error) { return { error: { msg: "Cannot get friends", system: true }, status: 401 } }

        const { friends } = response

        const users = []

        for (let i = 0; i < friends.length; i++) {
            const f = friends[i];

            const { user } = f.users[0] != _id ? await userDao.findById(f.users[0]) : await userDao.findById(f.users[1])

            user.password = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined

            users.push({ _id: f._id, user })
        }

        return { friends: users, status: 200 }
    }

    const listInvitesDeniedByUser = async({ _id, token }) => {
        const authValid = await validAuth(token, _id)

        if (authValid.error) { return authValid }

        const response = await findInvitesDeniedByUser({ _id })

        if (response.error) { return { error: { msg: "Cannot get friends", system: true }, status: 401 } }

        const { friends } = response

        const users = []

        for (let i = 0; i < friends.length; i++) {
            const f = friends[i];

            const { user } = f.users[0] != _id ? await userDao.findById(f.users[0]) : await userDao.findById(f.users[1])

            user.password = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined

            users.push({ _id: f._id, user })
        }

        return { friends: users, status: 200 }
    }

    // DaoFriend
    const registerFriend = async({ users, from, to }) => {
        const response = await friendDao.register({ users, from, to })
        return response
    }

    const findInvitesPendingOnHold = async({ _id }) => {
        const response = await friendDao.findInvitesPendingOnHold({ _id })
        return response
    }

    const findInvitesPendingAwaiting = async({ _id }) => {
        const response = await friendDao.findInvitesPendingAwaiting({ _id })
        return response
    }

    const findInvitesDeniedByUser = async({ _id }) => {
        const response = await friendDao.findInvitesDeniedByUser({ _id })
        return response
    }

    const findFriendsByIdUser = async({ _id }) => {
        const response = await friendDao.findFriendsByIdUser({ _id })
        return response
    }

    const findFriendshipByUsers = async({ users }) => {
        const response = await friendDao.findFriendshipByUsers({ users })
        return response
    }

    const findFriendshipById = async({ _id }) => {
        const response = await friendDao.findFriendshipById({ _id })
        return response
    }

    const findByIdUser = async({ _id }) => {
        const response = await friendDao.findByIdUser({ _id })
        return response
    }

    return {
        sendInviteFriendship,
        acceptInviteFriendship,
        deniedInviteFriendship,
        removeFriendship,
        listFriendsById,
        listInvitesPendingOnHold,
        listInvitesPendingAwaiting,
        listInvitesDeniedByUser,
        cancelInvite,
    }
}