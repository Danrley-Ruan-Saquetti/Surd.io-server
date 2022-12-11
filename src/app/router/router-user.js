import { Router } from "express"
import UserControl from "../controller/control-user.js"

const router = Router()
const userControl = UserControl()

router.get("/", async(req, res) => {
    const { token } = req.headers

    try {
        const response = await userControl.listUsers({ token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get users", system: true } })
    }
})

router.get("/:_id", async(req, res) => {
    const { _id } = req.params

    try {
        const response = await userControl.selectUser({ _id })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot select user", system: true } })
    }
})

router.post("/register", async(req, res) => {
    const { username, email, password } = req.body

    try {
        const response = await userControl.userRegister({ username, email, password })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot register user", system: true } })
    }
})

router.post("/login", async(req, res) => {
    const { login, password } = req.body

    try {
        const response = await userControl.userLogin({ login, password })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot login user", system: true } })
    }
})

router.post("/logout/:_id", async(req, res) => {
    const { _id } = req.params
    const { token } = req.headers

    // try {
    const response = await userControl.userLogout({ _id, token })

    const { status } = response

    response.status = undefined

    return res.status(status).send(response)
        // } catch (err) {
    console.log(err);
    //     return res.status(500).send({ error: { msg: "Cannot logout user", system: true } })
    // }
})

router.post("/forgot-password", async(req, res) => {
    const { email } = req.body

    try {
        const response = await userControl.userForgotPassword({ email })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot reset password", system: true } })
    }
})

router.post("/reset-password", async(req, res) => {
    const { email, password } = req.body
    const { token } = req.headers

    try {
        const response = await userControl.userResetPassword({ email, password, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot reset password", system: true } })
    }
})

router.post("/friends/send-invite", async(req, res) => {
    const { users } = req.body
    const { token } = req.headers

    try {
        const response = await userControl.sendInviteFriendship({ users, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot send invite friend", system: true } })
    }
})

router.post("/friends/accept-invite/:_id", async(req, res) => {
    const { _id } = req.params

    try {
        const response = await userControl.acceptFriendship({ _id })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot send invite friend", system: true } })
    }
})

router.post("/friends/denied-invite/:_id", async(req, res) => {
    const { _id } = req.params

    try {
        const response = await userControl.deniedFriendship({ _id })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot send invite friend", system: true } })
    }
})

router.post("/friends/remove-friendship/:_id", async(req, res) => {
    const { _id } = req.params

    try {
        const response = await userControl.removeFriendship({ _id })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot send invite friend", system: true } })
    }
})

router.get("/friends/:_id", async(req, res) => {
    const { token } = req.headers
    const { _id } = req.params

    try {
        const response = await userControl.listFriends({ _id, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get friends", system: true } })
    }
})

router.get("/friends/pending/:_id", async(req, res) => {
    const { token } = req.headers
    const { _id } = req.params

    // try {
    const response = await userControl.listFriendsPending({ _id, token })

    const { status } = response

    response.status = undefined

    return res.status(status).send(response)
        // } catch (err) {
    console.log(err);
    //     return res.status(500).send({ error: { msg: "Cannot get friends", system: true } })
    // }
})

router.get("/friends/denied/:_id", async(req, res) => {
    const { token } = req.headers
    const { _id } = req.params

    try {
        const response = await userControl.listFriendsDeniedByUser({ _id, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot get friends", system: true } })
    }
})

export default router