import mongoose from "../../database/index.js"

const ChatSchema = mongoose.Schema({
    idServer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Server",
        require: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

const Chat = mongoose.model("Chat", ChatSchema)

export default Chat