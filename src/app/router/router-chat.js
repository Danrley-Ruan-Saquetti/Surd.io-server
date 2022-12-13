import { Router } from "express"
import ServerControl from "../controller/control-server.js"

const router = Router()
const serverControl = ServerControl()

router.get("/", async(req, res) => {
    const { token } = req.headers
    const { _id } = req.body

    try {
        const response = await serverControl.listServers({ token, _id })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get servers", system: true } })
    }
})

export default router