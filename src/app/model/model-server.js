import mongoose from "../../database/index.js"

const ServerSchema = mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true,
        select: false
    },
    createAt: {
        type: Date,
        default: Date.now,
    }
})

const Server = mongoose.model("Server", ServerSchema)

export default Server