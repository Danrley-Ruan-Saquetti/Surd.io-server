import jwt from "jsonwebtoken"
import UserDao from "../model/dao-user.js"
import dotenv from "dotenv"
dotenv.config()

export const generatedToken = ({ _id }) => {
    return jwt.sign({ _id }, process.env.SERVER_HASH_SECRET, {
        expiresIn: 86400,
    })
}

export const validAuth = async(token, _id) => {
    const response = await UserDao().findById({ _id })

    if (!response.user) { return { error: { msg: "User not defined", system: true }, status: 400, valueOf: false } }

    const { user } = response

    if (!user.online) { return { error: { msg: "User offline", system: true }, status: 401, valueOf: false } }

    if (user.authToken != token) { return { error: { msg: "Token invalid", system: true }, status: 401, valueOf: false } }

    return { error: null, valueOf: true, status: 200 }
}

export const validToken = async(t, _id) => {
    const authHeader = t

    if (!authHeader) { return { error: { msg: "No token provided", system: true }, valueOf: false, status: 401 } }

    const parts = authHeader.split(" ")

    const [scheme, token] = parts

    if (parts.length != 2) { return { error: { msg: "Token error", system: true }, valueOf: false, status: 401 } }

    if (!/^Bearer$/i.test(scheme)) { return { error: { msg: "Token malformatted", system: true }, valueOf: false, status: 401 } }

    const authValid = await validAuth(token, _id)

    if (!authValid.valueOf) { return authValid }

    return jwt.verify(token, process.env.SERVER_HASH_SECRET, (err, decoded) => {
        if (err) { return { error: { msg: "Token invalid", system: true }, valueOf: false, status: 401 } }

        return { error: null, valueOf: true, status: 200 }
    })
}