import Admin from "./model-admin.js"

export default function AdminDao() {
    const register = async({ idUser = null }) => {
        const response = await Admin.create({ idUser }).then(async(res) => {
            return { admin: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const list = async() => {
        const response = await Admin.find().then(async(res) => {
            return { admins: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findById = async({ _id }) => {
        const response = await Admin.findById(_id).then(async(res) => {
            return { admin: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findByIdUser = async({ idUser }) => {
        const response = await Admin.findOne({ idUser }).then(async(res) => {
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