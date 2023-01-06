import jwt from "jsonwebtoken"
import UserDao from "../model/dao-user.js"
import dotenv from "dotenv"
import { IUser } from "../model/model-user.js"
dotenv.config()

const userDao = UserDao()

export const generatedToken = ({ _id, admin = false }: { _id: String, admin: Boolean }) => {
    return jwt.sign({ id: _id }, process.env[!admin ? "SERVER_HASH_SECRET" : "ADMIN_HASH_SECRET"] || "", {
        expiresIn: 86400,
    })
}

export const validAuth = async (token: String, idSocket: String) => {
    const response = await userDao.findByIdSocket({ idSocket })

    if (!response.user) { return { error: { msg: "Host not defined", system: true }, status: 400, valueOf: false, user: null } }

    const { user } = response

    if (!user.online) { return { error: { msg: "User offline", system: true }, status: 401, valueOf: false, user: null } }

    if (`${user.authToken}` != `${token}`) { return { error: { msg: "Token invalid", system: true }, status: 401, valueOf: false, user: null } }

    return { user, error: null, valueOf: true, status: 200 }
}

export const validToken = async (t: String, idSocket: String) => {
    const authHeader = t

    if (!authHeader) { return { error: { msg: "No token provided", system: true }, valueOf: false, status: 401, user: null } }

    const parts = authHeader.split(" ")

    const [scheme, token] = parts

    if (parts.length != 2) { return { error: { msg: "Token error", system: true }, valueOf: false, status: 401, user: null } }

    if (!/^Bearer$/i.test(scheme)) { return { error: { msg: "Token malformatted", system: true }, valueOf: false, status: 401, user: null } }

    const authValid = await validAuth(token, idSocket)

    if (!authValid.valueOf) { return authValid }

    const verify = (res: Function) => {
        const secretHash = process.env[!user?.idAdmin ? "SERVER_HASH_SECRET" : "ADMIN_HASH_SECRET"] || ""

        jwt.verify(token, secretHash, (err, decoded) => {
            res(err)
        })
    }

    const { user } = authValid

    const responseVerify: { user: IUser | null, error: any, valueOf: boolean, status: Number } = { user: null, error: null, valueOf: false, status: 401 }

    verify((err: any) => {
        if (err) {
            responseVerify.error = { msg: "Token invalid", system: true }
            return
        }
        responseVerify.user = user
        responseVerify.valueOf = true
        responseVerify.status = 200
    })

    return responseVerify
}