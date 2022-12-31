import { RULES_POST } from "../business-rule/rules.js"
import Post from "./model-post.js"

export default function PostDao() {
    const register = async({ chat = null, user = null, body = "", info = false }) => {
        const response = await Post.create({ chat, user, body, info }).then(async(res) => {
            return { post: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const list = async() => {
        const response = await Post.find().then(async(res) => {
            return { posts: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findLastPost = async({ chat }) => {
        const response = await Post.findOne({ chat }).limit(1).sort({ createAt: -1 }).then(async(res) => {
            return { post: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const listByChat = async({ chat, isPrivate = false }) => {
        const response = !isPrivate ? await Post.find({ chat }).limit(RULES_POST.LIMIT_LIST).sort({ createAt: -1 }).then(async(res) => {
            return { posts: res }
        }).catch(res => {
            return { error: res }
        }) : await Post.find({ chat }).then(async(res) => {
            return { posts: res }
        }).catch(res => {
            return { error: res }
        })

        return response
    }

    const findById = async({ _id }) => {
        const response = await Post.findById(_id).then(async(res) => {
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