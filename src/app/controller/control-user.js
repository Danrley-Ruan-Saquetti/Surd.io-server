import bcryptjs from "bcryptjs"
import crypto from "crypto"
import UserDao from "../model/dao-user.js"
import FriendDao from "../model/dao-friend.js"
import { generatedToken, validToken } from "../util/token.service.js"

export default function UserControl() {
    const userDao = UserDao()
    const friendDao = FriendDao()

    const verifyValues = ({ username, email, password }) => {
        const error = []

        if (!username) {
            error.push({ msg: "Inform the username", username: true })
        } else {
            if (username.split(" ").length > 1) {
                error.push({ msg: "Username incorrect", username: true })
            }
        }
        if (!email) {
            error.push({ msg: "Inform the e-mail", email: true })
        } else {
            if (email.split(" ").length > 1) {
                error.push({ msg: "E-mail incorrect", email: true })
            }
        }
        if (!password) {
            error.push({ msg: "Inform the password", password: true })
        }

        return { error, valueOf: error.length == 0 }
    }

    const verifyValuesAlreadyExists = async({ username, email, _id = null }) => {
        const error = []

        const { user: userUsername } = await findByUsername({ username })

        if (userUsername) {
            if (_id) {
                if (_id != userUsername._id) {
                    error.push({ msg: "Username already exist", username: true })
                }
            } else {
                error.push({ msg: "Username already exist", username: true })
            }
        }

        const { user: userEmail } = await findByEmail({ email })

        if (userEmail) {
            if (_id) {
                if (_id && _id != userEmail._id) {
                    error.push({ msg: "E-mail already exist", email: true })
                }
            } else {
                error.push({ msg: "E-mail already exist", email: true })
            }
        }

        return { error, valueOf: error.length == 0 }
    }

    const validAuthentication = async({ login, password }) => {
        const responseEmail = await findByEmail({ email: login })

        let user = null

        if (responseEmail.user) {
            user = responseEmail.user
        } else {
            const responseUsername = await findByUsername({ username: login })

            if (responseUsername.user) { user = responseUsername.user }
        }

        if (!user) { return { error: { msg: "User not found", system: true }, valueOf: false } }

        if (!await bcryptjs.compare(password, user.password)) { return { error: { msg: "Password incorrect", password: true }, valueOf: false } }

        return { user, error: [], valueOf: true }
    }

    // Use Cases
    const userRegister = async({ username = "", email = "", password = "" }) => {
        const valuesVerified = verifyValues({ username, email, password })

        if (!valuesVerified.valueOf) { return { error: valuesVerified.error, status: 400 } }

        const valuesAlreadyExistsVerified = await verifyValuesAlreadyExists({ email, username })

        if (!valuesAlreadyExistsVerified.valueOf) { return { error: valuesAlreadyExistsVerified.error, status: 400 } }

        const response = await register({ username, email, password: await bcryptjs.hash(password, 5) })

        if (response.error) { return { error: { msg: "Cannot register user", system: true }, status: 400 } }

        const { user } = response

        const token = generatedToken({ id: user })

        user.authToken = token
        user.online = true

        await user.save()

        user.password = undefined
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined

        return { user, success: { msg: "User created successfully", system: true }, status: 200 }
    }

    const userLogin = async({ login = "", password = "" }) => {
        if (!login) {
            return { error: { msg: "Inform the e-mail or username", login: true }, status: 400 }
        } else {
            if (login.split(" ").length > 1) {
                return { error: { msg: "Login incorrect", login: true }, status: 400 }
            }
        }
        if (!password) {
            return { error: { msg: "Inform the password", password: true }, status: 400 }
        }

        const validAuth = await validAuthentication({ login, password })

        if (!validAuth.valueOf) { return { error: validAuth.error, status: 401 } }

        const { user } = validAuth

        if (user.online) { return { error: { msg: "User already logged in this moment", system: true }, status: 401 } }

        const token = generatedToken({ id: user })

        user.authToken = token
        user.online = true
        user.lastTimeOnline = Date.now()

        await user.save()

        user.password = undefined
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined

        return { user, success: { msg: "User logged successfully", system: true }, status: 200 }
    }

    const userLogout = async({ _id, token }) => {
        const authValid = validToken(token, _id)

        if (!authValid.valueOf) { return authValid }

        const response = await findById({ _id })

        if (!response.user) { return { error: { msg: "User not found", system: true }, status: 400 } }

        const { user } = response

        user.online = false
        user.lastTimeOnline = Date.now()

        await user.save()

        return { success: { msg: "User logged out successfully", system: true }, status: 200 }
    }

    const userForgotPassword = async({ email }) => {
        const response = await findByEmail({ email })

        if (response.error) { return { error: { msg: "User not found", email: true }, status: 400 } }

        const { user } = response

        const token = crypto.randomBytes(20).toString("hex")

        const now = new Date()
        now.setHours(now.getHours() + 1)

        user.passwordResetToken = token
        user.passwordResetExpires = now

        user.save()

        return { status: 200, success: { msg: "User created successfully", system: true }, token }
    }

    const userResetPassword = async({ email, password, token }) => {
        const response = await findByEmail({ email })

        if (response.error) { return { error: { msg: "User not found", email: true }, status: 400 } }

        const { user } = response

        if (token != user.passwordResetToken) { return { error: { msg: "Token invalid", system: true }, status: 400 } }

        if (new Date() > user.passwordResetExpires) { return { error: { msg: "TokToken expired, generated a new one", system: true }, status: 400 } }

        user.password = await bcryptjs.hash(password, 5)

        await user.save()

        return { success: { msg: "User reset password successfully", system: true }, status: 200 }
    }

    const selectUser = async({ _id, token }) => {
        const tokenValid = validToken(token)

        if (!tokenValid.valueOf) { return { error: tokenValid.error, status: 400 } }

        const response = await findById({ _id })

        if (!response.user) { return { error: { msg: "User not found", system: true }, status: 401 } }

        const { user } = response

        user.password = undefined
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        user.authToken = undefined

        return { user, status: 200 }
    }

    const listUsers = async({ token }) => {
        const tokenValid = validToken(token)

        if (!tokenValid.valueOf) { return { error: tokenValid.error, status: 400 } }

        const response = await list()

        if (response.error) { return { error: { msg: "Cannot get users", system: true }, status: 401 } }

        const { users } = response

        users.forEach(user => {
            user.password = undefined
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            user.authToken = undefined
        });

        return { users, status: 200 }
    }

    // Events
    const EUserDisconnect = async({ _id }) => {
        const response = await findById({ _id })

        if (response.error) { return { error: { msg: "User not found", system: true }, status: 400 } }

        const { user } = response

        user.online = false
        user.lastTimeOnline = Date.now()

        await user.save()

        return { status: 200 }
    }

    // DaoUser
    const register = async({ username = "", email = "", password = "", online = false, idServerConnected = null, level = 0, xp = 0, xpUpLevel = 0, recordPoints = 0 }) => {
        const response = await userDao.register({ username, email, password, online, idServerConnected, level, xp, xpUpLevel, recordPoints })
        return response
    }

    const findById = async({ _id }) => {
        const response = await userDao.findById({ _id })
        return response
    }

    const findByEmail = async({ email }) => {
        const response = await userDao.findByEmail({ email })
        return response
    }

    const findByUsername = async({ username }) => {
        const response = await userDao.findByUsername({ username })
        return response
    }

    const list = async() => {
        const response = await userDao.list()
        return response
    }

    return {
        userRegister,
        userLogin,
        userLogout,
        userForgotPassword,
        userResetPassword,
        selectUser,
        listUsers,
        EUserDisconnect,
    }
}