import mongoose from "../../database/index.js"

const FriendSchema = mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    }],
    idChat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        default: null
    },
    pending: {
        type: Boolean,
        default: true
    },
    accepted: {
        type: Boolean,
        default: false
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    createAt: {
        type: Date,
        default: Date.now,
    }
})

const Friend = mongoose.model("Friend", FriendSchema)

export default Friend