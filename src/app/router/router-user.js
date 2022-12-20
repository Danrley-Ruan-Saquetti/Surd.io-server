import { Router } from "express"
import UserControl from "../controller/control-user.js"

const router = Router()
const userControl = UserControl()

router.get("/", async(req, res) => {
    const { token, id_socket } = req.headers

    try {
        const response = await userControl.listUsers({ token, idSocket: id_socket })

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
    const { token } = req.headers

    try {
        const response = await userControl.selectUser({ _id, token })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot select user", system: true } })
    }
})

router.post("/register", async(req, res) => {
    const { username, email, password, isAdmin } = req.body
    const { id_admin, token_admin, id_socket } = req.headers

    try {
        const response = await userControl.userRegister({ username, email, password, isAdmin, idAdmin: id_admin, tokenAdmin: token_admin, idSocket: id_socket })

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
    const { id_socket } = req.headers

    try {
        const response = await userControl.userLogin({ login, password, idSocket: id_socket })

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
    const { token, id_socket } = req.headers

    try {
        const response = await userControl.userLogout({ _id, token, idSocket: id_socket })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot logout user", system: true } })
    }
})

router.post("/remove/:_id", async(req, res) => {
    const { _id } = req.params
    const { token, id_socket } = req.headers

    try {
        const response = await userControl.userRemove({ _id, token, idSocket: id_socket })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot logout user", system: true } })
    }
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

router.post("/connect-server/:_id", async(req, res) => {
    const { _id } = req.params
    const { token, id_socket } = req.headers

    try {
        const response = await userControl.userConnectServer({ _id, token, idSocket: id_socket })

        const { status } = response

        response.status = undefined

        return res.status(status).send(response)
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: { msg: "Cannot reset password", system: true } })
    }
})

export default router