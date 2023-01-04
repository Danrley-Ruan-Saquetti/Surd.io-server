import mongoose from "../../database/index.js"

const UserSchema = mongoose.Schema({
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

const User = mongoose.model("User", UserSchema)

export default User