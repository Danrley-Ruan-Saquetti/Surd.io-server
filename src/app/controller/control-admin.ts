import { IId } from "../../database/index.js"
import AdminDao from "../model/dao-admin.js"
import { IUser } from "../model/model-user.js"
import { validToken } from "../util/token.service.js"

export default function AdminControl() {
    const adminDao = AdminDao()

    // Use Cases
    const createAdmin = async ({ user, idSocket, tokenAdmin }: { user: IUser, idSocket: String, tokenAdmin: String }) => {
        const tokenValid = await validToken(tokenAdmin, idSocket)

        if (!tokenValid.user) { return { ...tokenValid } }

        const responseAdminCreator = await findById({ _id: tokenValid.user._id })

        if (responseAdminCreator.error) { return { error: { msg: "Access Denied", system: true }, status: 401, valueOf: false } }

        const response = await register({ idUser: user._id })

        if (response.error) { return { error: { msg: "Cannot create admin", system: true }, status: 401, valueOf: false } }

        const { admin } = response

        return { admin, success: { msg: "Admin created successfully", system: true }, status: 200, valueOf: true }
    }

    const selectAdminById = async ({ _id, token }: { _id: String, token: String }) => {
        const tokenValid = await validToken(token, _id)

        if (!tokenValid.valueOf) { return tokenValid }

        return {}
    }

    // Dao
    const register = async ({ idUser = null }: { idUser: IId }) => {
        const response = await adminDao.register({ idUser })

        return response
    }

    const list = async () => {
        const response = await adminDao.list()

        return response
    }

    const findById = async ({ _id }: { _id: IId }) => {
        const response = await adminDao.findById({ _id })

        return response
    }

    const findByIdUser = async ({ idUser }: { idUser: IId }) => {
        const response = await adminDao.findByIdUser({ idUser })

        return response
    }

    return {
        createAdmin,
        findById
    }
}