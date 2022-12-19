import jwt from "jsonwebtoken"
import UserDao from "../model/dao-user.js"
import dotenv from "dotenv"
dotenv.config()

const userDao = UserDao()

export const generatedToken = ({ _id, admin = false }) => {
    return jwt.sign({ id: _id }, process.env[!admin ? "SERVER_HASH_SECRET" : "ADMIN_HASH_SECRET"], {
        expiresIn: 86400,
    })
}

export const validAuth = async(token, idSocket) => {
    const response = await userDao.findByIdSocket({ idSocket })

    if (!response.user) { return { error: { msg: "Host not defined", system: true }, status: 400, valueOf: false } }

    const { user } = response

    if (!user.online) { return { error: { msg: "User offline", system: true }, status: 401, valueOf: false } }

    if (user.authToken != token) { return { error: { msg: "Token invalid", system: true }, status: 401, valueOf: false } }

    return { user, error: null, valueOf: true, status: 200 }
}

export const validToken = async(t, idSocket) => {
    const authHeader = t

    if (!authHeader) { return { error: { msg: "No token provided", system: true }, valueOf: false, status: 401 } }

    const parts = authHeader.split(" ")

    const [scheme, token] = parts

    if (parts.length != 2) { return { error: { msg: "Token error", system: true }, valueOf: false, status: 401 } }

    if (!/^Bearer$/i.test(scheme)) { return { error: { msg: "Token malformatted", system: true }, valueOf: false, status: 401 } }

    const authValid = await validAuth(token, idSocket)

    if (!authValid.valueOf) { return authValid }

    const { user } = authValid

    const secretHash = process.env[!user.idAdmin ? "SERVER_HASH_SECRET" : "ADMIN_HASH_SECRET"]

    return jwt.verify(token, secretHash, (err, decoded) => {
        if (err) { return { error: { msg: "Token invalid", system: true }, valueOf: false, status: 401 } }

        return { user, error: null, valueOf: true, status: 200 }
    })
}