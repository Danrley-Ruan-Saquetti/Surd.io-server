import FriendDao from "../model/dao-friend.js"
import UserDao from "../model/dao-user.js"
import { validToken } from "../util/token.service.js"

export default function FriendControl() {
    const friendDao = FriendDao()
    const userDao = UserDao()

    // Use Cases
    const sendInviteFriendship = async({ users, from, to, token }) => {
        if (from === to) { return { error: { msg: "Cannot send invite to yourself", system: true }, status: 401 } }

        const responseFriendship = await findFriendshipByUsers({ users })

        if (responseFriendship.friendship) {
            if (responseFriendship.friendship.pending) {
                return { error: { msg: "Invite already send", system: true }, status: 401 }
            }
            if (responseFriendship.friendship.accepted) {
                return { error: { msg: "User already is friend", system: true }, status: 401 }
            }
        }

        const authValid = await validToken(token, from)

        if (!authValid.valueOf) { return authValid }

        const responseRecipient = await userDao.findById({ _id: to })

        if (!responseRecipient.user) { return { error: { msg: "Recipient not defined", system: true }, status: 400 } }

        const response = await registerFriend({ users, from, to })

        if (response.error) { return { error: { msg: "Cannot send invite friend", system: true }, status: 400 } }

        const { invite } = response

        for (let i = 0; i < invite.users.length; i++) {
            const user = invite.users[i]

            user.password = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined
        }

        responseFriendship.friendship && responseFriendship.friendship.remove()

        return { invite: { users: invite.users, _id: invite._id }, success: { msg: "Send invite friendship successfully", system: true }, status: 200 }
    }

    const acceptInviteFriendship = async({ _id, recipient, token }) => {
        const authValid = await validToken(token, recipient)

        if (!authValid.valueOf) { return authValid }

        const response = await findFriendshipById({ _id })

        if (!response.friendship) { return { error: { msg: "Invite not found", system: true }, status: 401 } }

        const { friendship } = response

        if (friendship.to != recipient) { return { error: { msg: "Access denied", system: true }, status: 401 } }

        if (!friendship.pending) { return { error: { msg: `Invite already ${friendship.accepted ? "accepted" : "denied"}`, system: true }, status: 401 } }

        friendship.pending = false
        friendship.accepted = true

        friendship.save()

        return { success: { msg: "Accept invite successfully", system: true }, status: 200 }
    }

    const removeFriendship = async({ _id, _idUser, token }) => {
        const authValid = await validToken(token, _idUser)

        if (!authValid.valueOf) { return authValid }

        const response = await findFriendshipById({ _id })

        if (!response.friendship) { return { error: { msg: "Friendship not found", system: true }, status: 401 } }

        const { friendship } = response

        friendship.remove()

        return { success: { msg: "Friendship removed successfully", system: true }, status: 200 }
    }

    const cancelInvite = async({ _id, _idUser, token }) => {
        const authValid = await validToken(token, _idUser)

        if (!authValid.valueOf) { return authValid }

        const response = await findFriendshipById({ _id })

        if (!response.friendship) { return { error: { msg: "Invite not found", system: true }, status: 401 } }

        const { friendship } = response

        if (friendship.from != _idUser) { return { error: { msg: "Access denied", system: true }, status: 401 } }

        if (!response.friendship.pending && response.friendship.accepted) { return { error: { msg: "Cannot cancel invite", system: true }, status: 401 } }

        friendship.remove()

        return { success: { msg: "Invite canceled successfully", system: true }, status: 200 }
    }

    const deniedInviteFriendship = async({ _id, recipient, token }) => {
        const authValid = await validToken(token, recipient)

        if (!authValid.valueOf) { return authValid }

        const response = await findFriendshipById({ _id })

        if (response.error) { return { error: { msg: "Invite not found", system: true }, status: 401 } }

        const { friendship } = response

        if (friendship.to != recipient) { return { error: { msg: "Access denied", system: true }, status: 401 } }

        if (!friendship.pending) { return { error: { msg: `Invite already ${friendship.accepted ? "accepted" : "denied"}`, system: true }, status: 401 } }

        friendship.pending = false
        friendship.accepted = false

        friendship.save()

        return { success: { msg: "Denied invite successfully", system: true }, status: 200 }
    }

    const listFriendsById = async({ _id, token }) => {
        const authValid = await validToken(token, _id)

        if (!authValid.valueOf) { return authValid }

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
        const authValid = await validToken(token, _id)

        if (!authValid.valueOf) { return authValid }

        const response = await findInvitesPendingOnHold({ _id })

        if (response.error) { return { error: { msg: "Cannot get invites", system: true }, status: 401 } }

        const { invites } = response

        const users = []

        for (let i = 0; i < invites.length; i++) {
            const f = invites[i];

            const { user } = f.users[0] != _id ? await userDao.findById(f.users[0]) : await userDao.findById(f.users[1])

            user.password = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined

            users.push({ _id: f._id, user })
        }

        return { invites: users, status: 200 }
    }

    const listInvitesPendingAwaiting = async({ _id, token }) => {
        const authValid = await validToken(token, _id)

        if (!authValid.valueOf) { return authValid }

        const response = await findInvitesPendingAwaiting({ _id })

        if (response.error) { return { error: { msg: "Cannot get invites", system: true }, status: 401 } }

        const { invites } = response

        const users = []

        for (let i = 0; i < invites.length; i++) {
            const f = invites[i];

            const { user } = f.users[0] != _id ? await userDao.findById(f.users[0]) : await userDao.findById(f.users[1])

            user.password = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined

            users.push({ _id: f._id, user })
        }

        return { invites: users, status: 200 }
    }

    const listInvitesDeniedByUser = async({ _id, token }) => {
        const authValid = await validToken(token, _id)

        if (!authValid.valueOf) { return authValid }

        const response = await findInvitesDeniedByUser({ _id })

        if (response.error) { return { error: { msg: "Cannot get invites", system: true }, status: 401 } }

        const { invites } = response

        const users = []

        for (let i = 0; i < invites.length; i++) {
            const f = invites[i];

            const { user } = f.users[0] != _id ? await userDao.findById(f.users[0]) : await userDao.findById(f.users[1])

            user.password = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined

            users.push({ _id: f._id, user })
        }

        return { invites: users, status: 200 }
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