import mongoose from "../../database/index.js"

const AdminSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    admin: {

    },
    createAt: {
        type: Date,
        default: Date.now,
    }
})

const Admin = mongoose.model("Admin", AdminSchema)

export default Admin