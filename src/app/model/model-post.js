import mongoose from "../../database/index.js"

const PostSchema = mongoose.Schema({
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

const Post = mongoose.model("Post", PostSchema)

export default Post