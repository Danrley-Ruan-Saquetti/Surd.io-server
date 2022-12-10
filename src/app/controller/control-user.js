import UserDao from "../model/dao-user.js"
import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import crypto from "crypto"
import dotenv from "dotenv"
dotenv.config()

export default function UserControl() {
    const userDao = UserDao()

    const generatedToken = ({ id }) => {
        return jwt.sign({ id }, process.env.SERVER_HASH_SECRET, {
            expiresIn: 86400,
        })
    }

    const validToken = (t) => {
        const authHeader = t

        if (!authHeader) { return { error: { msg: "No token provided", system: true }, valueOf: false } }
        const parts = authHeader.split(" ")

        if (parts.length != 2) { return { error: { msg: "Token error", system: true }, valueOf: false } }

        const [scheme, token] = parts

        if (!/^Bearer$/i.test(scheme)) { return { error: { msg: "Token malformatted", system: true }, valueOf: false } }

        return jwt.verify(token, process.env.SERVER_HASH_SECRET, (err, decoded) => {
            if (err) { return { error: { msg: "Token invalid", system: true }, valueOf: false } }

            return { error: {}, valueOf: true }
        })
    }

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

    const validAuthentication = async({ username, email, password }) => {
        const responseEmail = await findByEmail({ email }, "+authToken password")

        if (responseEmail.error) { return { error: { msg: "User not found", system: true }, valueOf: false } }

        const { user } = responseEmail

        if (!user) { return { error: { msg: "User not found", system: true }, valueOf: false } }

        console.log(user);

        if (user.username != username) { return { error: { msg: "Username incorrect", username: true }, valueOf: false } }

        if (!await bcryptjs.compare(password, user.password)) { return { error: { msg: "Password incorrect", password: true }, valueOf: false } }

        return { user, error: [], valueOf: true }
    }

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

        await user.save()

        user.password = undefined

        return { user, status: 200 }
    }

    const userLogin = async({ username = "", email = "", password = "" }) => {
        const valuesVerified = verifyValues({ username, email, password })

        if (!valuesVerified.valueOf) { return { error: valuesVerified.error, status: 400 } }

        const validAuth = await validAuthentication({ email, username, password })

        if (!validAuth.valueOf) { return { error: validAuth.error, status: 401 } }

        const { user } = validAuth


        if (user.online) { return { error: { msg: "User already logged in this moment", system: true }, status: 401 } }

        user.online = true

        await user.save()

        user.password = undefined

        return { user, token: generatedToken({ id: user }), status: 200 }
    }

    const userLogout = async({ _id, token }) => {
        const response = await findById({ _id }, "authToken")

        if (response.error) { return { error: { msg: "User not found", system: true }, status: 400 } }

        const { user } = response

        console.log(response);

        if (user.authToken != token) { return { error: { msg: "Token invalid", system: true }, status: 401 } }

        user.online = false

        await user.save()

        return { status: 200 }
    }

    const userForgotPassword = async({ email }) => {
        const response = await findByEmail({ email }, "passwordResetToken passwordResetExpires")

        if (response.error) { return { error: { msg: "User not found", email: true }, status: 400 } }

        const { user } = response

        const token = crypto.randomBytes(20).toString("hex")

        const now = new Date()
        now.setHours(now.getHours() + 1)

        user.passwordResetToken = token
        user.passwordResetExpires = now

        user.save()

        // mailer.sendMail({
        //     to: email,
        //     from: admin.email,
        //     template: "auth/forgot-password",
        //     context: { token }
        // }, (err) => {
        //     if (err) {
        //         return res.status(400).send({ error: "Cannot send forgot password email" })
        //     }

        //     return res.send({ admin, token })
        // })

        return { status: 200, token }
    }

    const userResetPassword = async({ email, password, token }) => {
        const response = await findByEmail({ email }, "+password passwordResetToken passwordResetExpires")

        if (response.error) { return { error: { msg: "User not found", email: true }, status: 400 } }

        const { user } = response

        if (token != user.passwordResetToken) { return { error: { msg: "Token invalid", system: true }, status: 400 } }

        if (new Date() > user.passwordResetExpires) { return { error: { msg: "TokToken expired, generated a new one", system: true }, status: 400 } }

        user.password = await bcryptjs.hash(password, 5)

        await user.save()

        return { status: 200 }
    }

    const selectUser = async({ _id }) => {
        const response = await findById({ _id })

        if (response.error) { return { error: { msg: "User not found", system: true }, status: 401 } }

        const { user } = response

        return { user, status: 200 }
    }

    // Dao
    const register = async({ username = "", email = "", password = "", online = false, idServerConnected = null, level = 0, xp = 0, xpUpLevel = 0, recordPoints = 0 }) => {
        const response = await userDao.register({ username, email, password, online, idServerConnected, level, xp, xpUpLevel, recordPoints })
        return response
    }

    const findById = async({ _id }, select = "") => {
        const response = await userDao.findById({ _id }, { select })
        return response
    }

    const findByEmail = async({ email }, select = "") => {
        const response = await userDao.findByEmail({ email }, { select })
        return response
    }

    const findByUsername = async({ username }, select = "") => {
        const response = await userDao.findByUsername({ username }, { select })
        return response
    }

    return {
        userRegister,
        userLogin,
        userLogout,
        userForgotPassword,
        userResetPassword,
        selectUser,
    }
}