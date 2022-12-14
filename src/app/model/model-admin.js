import mongoose from "../../database/index.js"

const AdminSchema = mongoose.Schema({
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

const Admin = mongoose.model("Admin", AdminSchema)

export default Admin