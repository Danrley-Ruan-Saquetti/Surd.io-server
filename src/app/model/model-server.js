import mongoose from "../../database/index.js"

const ServerSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    lobby: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date.now,
    }
})

const Server = mongoose.model("Server", ServerSchema)

export default Server