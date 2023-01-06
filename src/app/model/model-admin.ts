import { mongoose, IId } from "../../database/index.js"

export interface IAdmin extends mongoose.Document {
    idUser: IId
    createAt?: Date
}

const AdminSchema = new mongoose.Schema<IAdmin>({
    idUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    createAt: {
        type: Date,
        default: Date.now,
    }
})

export const Admin = mongoose.model("Admin", AdminSchema)
