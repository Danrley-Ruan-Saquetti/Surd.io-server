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

const DIMENSIONS = {
    map: 700,
    players: 40
}

const XP_LENGTH_FOR_RESPAWN = Math.round(DIMENSIONS.map / (DIMENSIONS.players * 5))

const XP_INTERVAL_NEW = 1000 / .2 // 5 seconds

const LENGTH_PU = 9

const LENGTH_UPGRADES_PU = 6

const VALUE_PU = 3

export const RULES_GAME = {
    game: {
        intervalUpdate: 1000 / 90,
        intervalFast: 1000 / 150,
    },
    map: {
        dimension: {
            width: DIMENSIONS.map,
            height: DIMENSIONS.map
        }
    },
    player: {
        dimension: {
            width: DIMENSIONS.players,
            height: DIMENSIONS.players
        },
        xpUpLevel: (level: number) => {
            return Math.ceil(((level * 1.5) * 15 ^ 1.5) / 10) * 10
        },
        projectile: {
            range: 100,
            reload: 1000 * 5, // 5 seconds
            size: 5,
            speed: 3,
        },
        damage: 10,
        criticalDamage: 10,
        health: 100,
        defense: 100,
        speedMaster: 5,
    },
    xps: {
        lengthForRespawn: XP_LENGTH_FOR_RESPAWN,
        intervalNew: XP_INTERVAL_NEW,
        types: [
            { dimension: { width: 10, height: 10 }, value: 2, color: "", tx: 65 },
            { dimension: { width: 15, height: 15 }, value: 5, color: "", tx: 85 },
            { dimension: { width: 20, height: 20 }, value: 10, color: "", tx: 97 },
            { dimension: { width: 25, height: 25 }, value: 20, color: "", tx: 100 },
        ]
    },
    powerUp: {
        lengthUpgradesPU: LENGTH_UPGRADES_PU,
        maxUpgrades: Math.round((LENGTH_UPGRADES_PU * LENGTH_PU) / 2),
        values: {
            damage: 3,
            criticalDamage: 3,
            defense: 3,
            health: (Math.round((100 * 2) / LENGTH_UPGRADES_PU)),
            size: VALUE_PU,
            speed: VALUE_PU,
            projectileSpeed: VALUE_PU,
            projectileSize: VALUE_PU,
            projectileDamage: VALUE_PU,
        }
    }
}
