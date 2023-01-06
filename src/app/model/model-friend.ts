import { IId, mongoose } from "../../database/index.js"

export interface IFriend extends mongoose.Document {
    users: IId[]
    idChat?: IId
    pending?: Boolean
    accepted?: Boolean
    from: IId
    to: IId
    createAt?: Date
}

const FriendSchema = new mongoose.Schema<IFriend>({
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

export const Friend = mongoose.model("Friend", FriendSchema)