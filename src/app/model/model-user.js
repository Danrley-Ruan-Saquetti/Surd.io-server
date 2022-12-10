import mongoose from "../../database/index.js"
import bcryptjs from "bcryptjs"

const UserSchema = mongoose.Schema({
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
        require: true,
        select: false
    },
    online: {
        type: Boolean,
        require: true,
    },
    // idServerConnected: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Server",
    //     require: true
    // },
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
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    authToken: {
        type: String,
        select: false,
    },
    createAt: {
        type: Date,
        default: Date.now,
    }
})

const User = mongoose.model("User", UserSchema)

User.find().then(res => {
    res.forEach(user => {
        user.online = false
        user.save()
    })
})

export default User