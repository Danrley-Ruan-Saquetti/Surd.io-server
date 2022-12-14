import AdminDao from "../model/dao-admin.js"
import { validToken } from "../util/token.service.js"

export default function AdminControl() {
    const adminDao = AdminDao()

    // Use Cases
    const createAdmin = async({ user, idAdmin, tokenAdmin }) => {
        const tokenValid = await validToken(tokenAdmin, idAdmin)

        if (!tokenValid.valueOf) { return tokenValid }

        const responseAdminCreator = await findById({ _id: idAdmin })

        if (responseAdminCreator.error) { return { error: { msg: "Access Denied", system: true }, status: 401, valueOf: false } }

        const response = await register({ idUser: user._id })

        if (response.error) { return { error: { msg: "Cannot create admin", system: true }, status: 401 } }

        const { admin } = response

        return { admin, success: { msg: "Admin created successfully", system: true }, status: 200, valueOf: true }
    }

    const selectAdminById = async({ _id, token }) => {
        const tokenValid = await validToken(token, _id, true)

        if (!tokenValid.valueOf) { return tokenValid }

        return {}
    }

    // Dao
    const register = async({ idUser = null }) => {
        const response = await adminDao.register({ idUser })

        return response
    }

    const list = async() => {
        const response = await adminDao.list()

        return response
    }

    const findById = async({ _id }) => {
        const response = await adminDao.findById({ _id })

        return response
    }

    const findByIdUser = async({ idUser }) => {
        const response = await adminDao.findByIdUser({ idUser })

        return response
    }

    return {
        createAdmin,
        findById
    }
}