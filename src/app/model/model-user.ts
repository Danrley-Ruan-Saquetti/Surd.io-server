import { IId, mongoose } from "../../database/index.js"

export interface IUser extends mongoose.Document {
    idAdmin?: IId | null
    idSocket?: String | null
    username: String
    email: String
    password: String
    online: Boolean
    serverConnected?: IId | null
    level: Number
    xp: Number
    xpUpLevel: Number
    coins: Number
    recordPoints: Number
    damage: Number
    health: Number
    defense: Number
    speed: Number
    size: Number
    passwordResetToken?: String | null
    passwordResetExpires?: Date | null
    authToken?: String | null
    lastToken?: String | null
    lastTimeOnline?: Date | null
    createAt?: Date | null
}

const UserSchema = new mongoose.Schema<IUser>({
    idAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null
    },
    idSocket: {
        type: String,
        default: null
    },
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    online: {
        type: Boolean,
        require: true,
    },
    serverConnected: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Server",
        default: null
    },
    level: {
        type: Number,
        require: true
    },
    xp: {
        type: Number,
        require: true
    },
    xpUpLevel: {
        type: Number,
        require: true
    },
    coins: {
        type: Number,
        require: true
    },
    recordPoints: {
        type: Number,
        require: true
    },
    damage: {
        type: Number,
        require: true
    },
    health: {
        type: Number,
        require: true
    },
    defense: {
        type: Number,
        require: true
    },
    speed: {
        type: Number,
        require: true
    },
    size: {
        type: Number,
        require: true
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetExpires: {
        type: Date,
        default: null
    },
    authToken: {
        type: String,
        default: null
    },
    lastToken: {
        type: String,
        default: null
    },
    lastTimeOnline: {
        type: Date,
        default: Date.now
    },
    createAt: {
        type: Date,
        default: Date.now,
    }
})

export const User = mongoose.model("User", UserSchema)