import { IId } from "../../database/index.js"
import { Admin, IAdmin } from "./model-admin.js"

export default function AdminDao() {
    const register = async ({ idUser = null }: { idUser: IId }) => {
        const response: { admin?: IAdmin, error?: any } = await Admin.create({ idUser }).then(async (res) => {
            return { admin: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const list = async () => {
        const response: { admins?: IAdmin[], error?: any } = await Admin.find().then(async (res) => {
            return { admins: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findById = async ({ _id }: { _id: IId }) => {
        const response: { admin?: IAdmin | null, error?: any } = await Admin.findById(_id).then(async (res) => {
            return { admin: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByIdUser = async ({ idUser }: { idUser: IId }) => {
        const response: { admin?: IAdmin | null, error?: any } = await Admin.findOne({ idUser }).then(async (res) => {
            return { admin: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    return {
        register,
        list,
        findById,
        findByIdUser,
    }
}