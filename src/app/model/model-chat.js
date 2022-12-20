import mongoose from "../../database/index.js"

const ChatSchema = mongoose.Schema({
    idServer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Server",
        default: null
    },
    isServer: {
        type: Boolean,
        default: true
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }],
    createAt: {
        type: Date,
        default: Date.now
    }
})

const Chat = mongoose.model("Chat", ChatSchema)

export default Chat