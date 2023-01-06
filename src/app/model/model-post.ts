import { IId, mongoose } from "../../database/index.js"

export interface IPost extends mongoose.Document {
    chat: IId
    user?: IId
    body: String
    info?: Boolean
    createAt?: Date
}

const PostSchema = new mongoose.Schema<IPost>({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        require: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    body: {
        type: String,
        require: true
    },
    info: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

export const Post = mongoose.model("Post", PostSchema)