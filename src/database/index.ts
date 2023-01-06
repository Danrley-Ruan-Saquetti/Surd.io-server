import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

mongoose.connect(process.env.DB_URL_CONNECTION || "")
mongoose.Promise = global.Promise
mongoose.set("strictQuery", false)

export { mongoose }

export type IId = mongoose.Schema.Types.ObjectId | null