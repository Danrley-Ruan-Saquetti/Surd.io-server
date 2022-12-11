import { Router } from "express"
import FriendControl from "../controller/control-friend.js"

const router = Router()
const friendControl = FriendControl()

router.get("/:_id", async(req, res) => {
    const { token } = req.headers
    const { _id } = req.params

    try {
        const response = await friendControl.listFriendsById({ _id, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get friends", system: true } })
    }
})

router.post("/send-invite", async(req, res) => {
    const { users, from, to } = req.body
    const { token } = req.headers

    try {
        const response = await friendControl.sendInviteFriendship({ users, from, to, token })

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
    const { token } = req.headers
    const { recipient } = req.body

    try {
        const response = await friendControl.acceptInviteFriendship({ _id, token, recipient })

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
    const { token } = req.headers
    const { recipient } = req.body

    try {
        const response = await friendControl.deniedInviteFriendship({ _id, token, recipient })

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
    const { token } = req.headers
    const { _idUser } = req.body

    try {
        const response = await friendControl.cancelInvite({ _idUser, _id, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot cancel invite friendship", system: true } })
    }
})

router.delete("/remove-friendship/:_id", async(req, res) => {
    const { token } = req.headers
    const { _id } = req.params
    const { _idUser } = req.body

    try {
        const response = await friendControl.removeFriendship({ _id, _idUser, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot send invite friend", system: true } })
    }
})

router.get("/pending/on-hold/:_id", async(req, res) => {
    const { token } = req.headers
    const { _id } = req.params

    try {
        const response = await friendControl.listInvitesPendingOnHold({ _id, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get friends", system: true } })
    }
})

router.get("/pending/awaiting/:_id", async(req, res) => {
    const { token } = req.headers
    const { _id } = req.params

    try {
        const response = await friendControl.listInvitesPendingAwaiting({ _id, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get friends", system: true } })
    }
})

router.get("/denied/:_id", async(req, res) => {
    const { token } = req.headers
    const { _id } = req.params

    try {
        const response = await friendControl.listInvitesDeniedByUser({ _id, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get friends", system: true } })
    }
})

export default router