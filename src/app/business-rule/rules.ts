export const RULES_USER = {
    VALID_REGISTER: ({ username, email, password }: { username: String, email: String, password: String }) => {
        const error = []

        const INCORRECT_CHARACTERS = " !@#$%&*|\\/?+=§`´{}[]()ºª°<>,:;'\"¹²³£¢"

        if (!username) {
            error.push({ msg: "Inform the username", username: true })
        } else {
            for (let i = 0; i < username.length; i++) {
                const letter = username.charAt(i)

                if (INCORRECT_CHARACTERS.includes(letter)) {
                    error.push({ msg: "Username incorrect", username: true })
                }
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

export const RULES_SERVER = {
    LIMIT_PLAYERS: 250
}

export const RULES_POST = {
    LIMIT_LIST: 20
}

export const RULES_GAME = {
    map: {
        dimension: {
            width: 800,
            height: 800
        }
    },
    player: {
        dimension: {
            width: 40,
            height: 40
        }
    }
}