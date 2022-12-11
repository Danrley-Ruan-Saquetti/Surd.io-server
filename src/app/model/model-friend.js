import mongoose from "../../database/index.js"

const FriendSchema = mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    }],
    pending: {
        type: Boolean,
        default: true
    },
    accepted: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date.now,
    }
})

const Friend = mongoose.model("Friend", FriendSchema)

export default Friend