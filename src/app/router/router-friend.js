import { Router } from "express"
import FriendControl from "../controller/control-friend.js"

const router = Router()
const friendControl = FriendControl()

router.get("/", async(req, res) => {
    const { token, id_socket } = req.headers

    try {
        const response = await friendControl.listFriendsById({ idSocket: id_socket, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get friends", system: true } })
    }
})

router.post("/send-invite", async(req, res) => {
    const { to } = req.body
    const { token, id_socket } = req.headers

    try {
        const response = await friendControl.sendInviteFriendship({ idSocket: id_socket, to, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot send invite friend", system: true } })
    }
})

router.post("/accept-invite/:_id", async(req, res) => {
    const { _id } = req.params
    const { token, id_socket } = req.headers

    try {
        const response = await friendControl.acceptInviteFriendship({ _id, token, idSocket: id_socket })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot send invite friend", system: true } })
    }
})

router.post("/denied-invite/:_id", async(req, res) => {
    const { _id } = req.params
    const { token, id_socket } = req.headers

    try {
        const response = await friendControl.deniedInviteFriendship({ _id, token, idSocket: id_socket })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot send invite friend", system: true } })
    }
})

router.delete("/cancel-invite/:_id", async(req, res) => {
    const { _id } = req.params
    const { token, id_socket } = req.headers

    try {
        const response = await friendControl.cancelInvite({ _id, idSocket: id_socket, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot cancel invite friendship", system: true } })
    }
})

router.delete("/remove-friendship/:_id", async(req, res) => {
    const { _id } = req.params
    const { token, id_socket } = req.headers

    try {
        const response = await friendControl.removeFriendship({ _id, idSocket: id_socket, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot send invite friend", system: true } })
    }
})

router.get("/pending/on-hold", async(req, res) => {
    const { token, id_socket } = req.headers

    try {
        const response = await friendControl.listInvitesPendingOnHold({ idSocket: id_socket, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get friends", system: true } })
    }
})

router.get("/pending/awaiting", async(req, res) => {
    const { token, id_socket } = req.headers

    try {
        const response = await friendControl.listInvitesPendingAwaiting({ idSocket: id_socket, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get friends", system: true } })
    }
})

router.get("/denied", async(req, res) => {
    const { token, id_socket } = req.headers

    try {
        const response = await friendControl.listInvitesDeniedByUser({ idSocket: id_socket, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get friends", system: true } })
    }
})

export default router