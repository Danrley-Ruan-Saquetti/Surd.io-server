export const RULES_USER = {
    VALID_REGISTER: ({ username, email, password }) => {
        const error = []

        if (!username) {
            error.push({ msg: "Inform the username", username: true })
        } else {
            if (username.split(" ").length > 1) {
                error.push({ msg: "Username incorrect", username: true })
            }
        }
        if (!email) {
            error.push({ msg: "Inform the e-mail", email: true })
        } else {
            if (email.split(" ").length > 1) {
                error.push({ msg: "E-mail incorrect", email: true })
            }
        }
        if (!password) {
            error.push({ msg: "Inform the password", password: true })
        }

        return { error, valueOf: error.length == 0 }
    }
}

export const RULES_POST = {
    LIMIT_LIST: 15
}