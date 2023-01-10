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
    game: {
        FPS: 1000 / 120
    },
    map: {
        dimension: {
            width: 1000,
            height: 1000
        }
    },
    player: {
        dimension: {
            width: 40,
            height: 40
        }
    },
    xps: {
        intervalNew: 1000 / 2,
        types: [
            { dimension: { width: 10, height: 10 }, value: 2, color: "", tx: 50 },
            { dimension: { width: 15, height: 15 }, value: 5, color: "", tx: 80 },
            { dimension: { width: 20, height: 20 }, value: 10, color: "", tx: 95 },
            { dimension: { width: 25, height: 25 }, value: 20, color: "", tx: 0 },
        ]
    }
}