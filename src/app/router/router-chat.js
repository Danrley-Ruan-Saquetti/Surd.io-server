import { Router } from "express"
import ChatControl from "../controller/control-chat.js"
import PostControl from "../controller/control-post.js"

const router = Router()
const chatControl = ChatControl()
const postControl = PostControl()

router.get("/", async(req, res) => {
    const { token, id_socket } = req.headers

    try {
        const response = await postControl.listPosts({ idSocket: id_socket, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get posts", system: true } })
    }
})

router.get("/:_id", async(req, res) => {
    const { token, id_socket } = req.headers
    const { _id } = req.params

    try {
        const response = await postControl.listPosts({ idChat: _id, idSocket: id_socket, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get posts", system: true } })
    }
})

router.post("/send-post", async(req, res) => {
    const { token, id_socket } = req.headers
    const { body } = req.body

    try {
        const response = await postControl.userSendPost({ idSocket: id_socket, token, body })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot send post", system: true } })
    }
})

router.post("/send-post/:_id", async(req, res) => {
    const { token, id_socket } = req.headers
    const { _id } = req.params
    const { body } = req.body

    try {
        const response = await postControl.userSendPost({ idChat: _id, idSocket: id_socket, token, body })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot send post", system: true } })
    }
})

export default router