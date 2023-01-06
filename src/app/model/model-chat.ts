import { IId, mongoose } from "../../database/index.js"

export interface IChat extends mongoose.Document {
    idServer?: IId
    isServer?: Boolean
    idFriend?: IId
    createAt?: Date
}

const ChatSchema = new mongoose.Schema<IChat>({
    idServer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Server",
        default: null
    },
    isServer: {
        type: Boolean,
        default: true
    },
    idFriend: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Friend",
        default: null
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

export const Chat = mongoose.model("Chat", ChatSchema)