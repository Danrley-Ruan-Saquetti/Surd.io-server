import mongoose from "../../database/index.js"

const ServerSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    isLobby: {
        type: Boolean,
        default: false
    },
    playersOnline: {
        type: Number,
        default: 0
    },
    createAt: {
        type: Date,
        default: Date.now,
    }
})

const Server = mongoose.model("Server", ServerSchema)

export default Server