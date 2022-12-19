import { Router } from "express"
import ServerControl from "../controller/control-server.js"

const router = Router()
const serverControl = ServerControl()

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

router.get("/:_id", async(req, res) => {
    const { _id } = req.params
    const { token } = req.headers

    try {
        const response = await serverControl.selectServer({ _id, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot select server", system: true } })
    }
})

router.post("/create", async(req, res) => {
    const { token } = req.headers
    const { name, lobby } = req.body

    try {
        const response = await serverControl.createServer({ name, lobby, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get servers", system: true } })
    }
})

export default router