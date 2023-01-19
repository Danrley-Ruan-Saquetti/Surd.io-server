import { mongoose } from "../../database/index.js"

export default interface ISetting extends mongoose.Document {
    showStatusOnline: Boolean
    enableFriendInvite: Boolean
    notifyFriendsStatusOnline: Boolean
    showFriendsChatInGame: Boolean
    keys: [
        { key: String, index: number }
    ]
}

const SettingSchema = new mongoose.Schema<ISetting>({

})

export const Setting = mongoose.model("Setting", SettingSchema)