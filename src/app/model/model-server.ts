import { mongoose } from "../../database/index.js"

export interface IServer extends mongoose.Document {
    name: String
    isLobby?: Boolean
    playersOnline?: Number
    createAt?: Date
}

const ServerSchema = new mongoose.Schema<IServer>({
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

export const Server = mongoose.model("Server", ServerSchema)
