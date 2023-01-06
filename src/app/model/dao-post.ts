import { IId } from "../../database/index.js"
import { Post, IPost } from "./model-post.js"
import { RULES_POST } from "../business-rule/rules.js"

export default function PostDao() {
    const register = async ({ chat = null, user = null, body = "", info = false }: { chat: IId, user?: IId, body: String, info?: Boolean }) => {
        const response: { post?: IPost, error?: any } = await Post.create({ chat, user, body, info }).then(async (res) => {
            return { post: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const list = async () => {
        const response: { posts?: IPost[] | null, error?: any } = await Post.find().then(async (res) => {
            return { posts: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findLastPost = async ({ chat }: { chat: IId }) => {
        const response: { post?: IPost | null, error?: any } = await Post.findOne({ chat, info: false }).limit(1).sort({ createAt: -1 }).then(async (res) => {
            return { post: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const listByChat = async ({ chat, isPrivate = false }: { chat: IId, isPrivate?: Boolean }) => {
        const response: { posts?: IPost[] | null, error?: any } = !isPrivate ? await Post.find({ chat }).limit(RULES_POST.LIMIT_LIST).sort({ createAt: -1 }).then(async (res) => {
            return { posts: res }
        }).catch(res => {
            return { error: res }
        }) : await Post.find({ chat }).then(async (res) => {
            return { posts: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findById = async ({ _id }: { _id: IId }) => {
        const response: { post?: IPost | null, error?: any } = await Post.findById(_id).then(async (res) => {
            return { post: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    return {
        register,
        list,
        listByChat,
        findById,
        findLastPost
    }
}