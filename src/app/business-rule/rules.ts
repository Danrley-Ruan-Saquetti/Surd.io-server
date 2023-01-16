const DIMENSIONS = {
    map: 10000,
    players: 40
}

const SPEED_PLAYER_MASTER = 5

const ONE_SECOND = 1000 // 1 second

const DIMENSION_QUADRANT = DIMENSIONS.players * 4

const XP_LENGTH_FOR_RESPAWN = Math.round(DIMENSIONS.map / DIMENSION_QUADRANT)

const XP_INTERVAL_NEW = ONE_SECOND / .2 // 5 seconds

const XP_MAX_LENGTH = XP_LENGTH_FOR_RESPAWN * 6

const POTION_LENGTH_FOR_RESPAWN = Math.round(DIMENSIONS.map / (DIMENSION_QUADRANT * 5))

const POTION_INTERVAL_NEW = ONE_SECOND / .1 // 10 seconds

const POTION_MAX_LENGTH = POTION_LENGTH_FOR_RESPAWN * 6

const LENGTH_PU = 9

const LENGTH_UPGRADES_PU = 6

const INCORRECT_CHARACTERS = " !@#$%&*|\\/?+=§`´{}[]()ºª°<>,:;'\"¹²³£¢"

export const RULES_USER = {
    incorrectCharacters: INCORRECT_CHARACTERS
}

export const RULES_SERVER = {
    servers: [
        { name: "Server A", isLobby: false },
        { name: "Server B", isLobby: false },
        { name: "Server C", isLobby: false },
        { name: "Server D", isLobby: false },
        { name: "Server E", isLobby: false },
        { name: "Lobby", isLobby: true }
    ],
    LIMIT_PLAYERS: 250
}

export const RULES_POST = {
    LIMIT_LIST: 20
}

export const RULES_GAME = {
    game: {
        intervalUpdate: ONE_SECOND / 90,
        intervalFast: ONE_SECOND / 150,
    },
    map: {
        dimension: {
            width: DIMENSIONS.map,
            height: DIMENSIONS.map
        },
        quadrant: {
            dimension: DIMENSION_QUADRANT
        }
    },
    player: {
        fov: (sizePlayer: { width: number, height: number }) => {
            return Math.round((sizePlayer.height * sizePlayer.width) * .95)
        },
        dimension: {
            width: DIMENSIONS.players,
            height: DIMENSIONS.players
        },
        xpUpLevel: (level: number) => {
            return Math.ceil(((level * 1.5) * 15 ^ 1.5) / 10) * 10
        },
        projectile: {
            range: 100,
            reload: ONE_SECOND * 5, // 5 seconds
            size: 5,
            speed: 3,
        },
        damage: 10,
        criticalDamage: 10,
        hp: 100,
        defense: 100,
        speedMaster: SPEED_PLAYER_MASTER,
    },
    ranking: {
        intervalUpdateListRanking: ONE_SECOND * 1,
        listLength: 25
    },
    xps: {
        lengthForRespawn: XP_LENGTH_FOR_RESPAWN,
        intervalNew: XP_INTERVAL_NEW,
        maxLength: XP_MAX_LENGTH,
        types: [
            { dimension: { width: 10, height: 10 }, value: 2, color: "", tx: 65 },
            { dimension: { width: 15, height: 15 }, value: 5, color: "", tx: 85 },
            { dimension: { width: 20, height: 20 }, value: 10, color: "", tx: 97 },
            { dimension: { width: 25, height: 25 }, value: 20, color: "", tx: 100 },
        ]
    },
    potions: {
        lengthForRespawn: POTION_LENGTH_FOR_RESPAWN,
        intervalNew: POTION_INTERVAL_NEW,
        maxLength: POTION_MAX_LENGTH,
        types: [
            { dimension: { width: 10, height: 10 }, value: 10, color: "", tx: 45 },
            { dimension: { width: 15, height: 15 }, value: 25, color: "", tx: 72 },
            { dimension: { width: 20, height: 20 }, value: 50, color: "", tx: 87 },
            { dimension: { width: 25, height: 25 }, value: 100, color: "", tx: 97 },
            { dimension: { width: 35, height: 35 }, value: 250, color: "", tx: 100 },
        ]
    },
    powerUp: {
        lengthUpgradesPU: LENGTH_UPGRADES_PU,
        maxUpgrades: Math.round((LENGTH_UPGRADES_PU * LENGTH_PU) / 2),
        values: {
            damage: 3,
            criticalDamage: 3,
            defense: 3,
            hp: Math.round((100 * 2) / LENGTH_UPGRADES_PU),
            size: 3,
            speed: Math.floor((SPEED_PLAYER_MASTER * 2) / LENGTH_UPGRADES_PU),
            projectileSpeed: 1,
            projectileSize: 1,
            projectileDamage: 5,
        }
    }
}

console.log("\nRULES_USER")
console.log(RULES_USER);
console.log("\nRULES_SERVER")
console.log(RULES_SERVER);
console.log("\nRULES_POST")
console.log(RULES_POST);
console.log("\nRULES_GAME game")
console.log(RULES_GAME.game);
console.log("\nRULES_GAME map")
console.log(RULES_GAME.map);
console.log("\nRULES_GAME player")
console.log(RULES_GAME.player);
console.log("\nRULES_GAME powerUp")
console.log(RULES_GAME.powerUp);
console.log("\nRULES_GAME xps")
console.log(RULES_GAME.xps);
console.log("\nRULES_GAME potions")
console.log(RULES_GAME.potions);
