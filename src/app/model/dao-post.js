import ChatDao from "./dao-chat.js"
import ServerDao from "./dao-server.js"
import Post from "./model-post.js"

export default function PostDao() {
    const register = async({ idChat = null, idUser = null, body = "", info = false }) => {
        const response = await Post.create({ idChat, idUser, body, info }).then(async(res) => {
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

    const listByChat = async({ idChat }) => {
        const response = await Post.find({ idChat }).then(async(res) => {
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
        findById
    }
}