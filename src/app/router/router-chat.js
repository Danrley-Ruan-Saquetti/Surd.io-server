import { Router } from "express"
import ChatControl from "../controller/control-chat.js"

const router = Router()
const serverControl = ChatControl()

router.get("/", async(req, res) => {
    const { token, id_socket } = req.headers

    try {
        const response = await serverControl.listServers({ token, idSocket: id_socket })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get servers", system: true } })
    }
})

export default router