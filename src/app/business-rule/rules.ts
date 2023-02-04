const DIMENSIONS = {
    map: 2500,
    players: 40
}

const PROJECTILE_SIZE = 4

const PROJECTILE_SPEED = 7

const SPEED_PLAYER_MASTER = 5

const SPEED_ENEMY_MASTER_INITIAL = Math.round(SPEED_PLAYER_MASTER / 2)

const ONE_SECOND = 1000 // 1 second

const DIMENSION_QUADRANT = DIMENSIONS.players * 4

const XP_LENGTH_FOR_RESPAWN = Math.round(DIMENSIONS.map / DIMENSION_QUADRANT)

const XP_INTERVAL_NEW = ONE_SECOND * 5 // 5 seconds

const XP_MAX_LENGTH = XP_LENGTH_FOR_RESPAWN * 6

const ENEMY_LENGTH_FOR_PLAYER = 6

const ENEMY_LENGTH_SPAWN_INTERVAL_FOR_PLAYER = Math.round(ENEMY_LENGTH_FOR_PLAYER / 3)

const ENEMY_INTERVAL_NEW = ONE_SECOND * 5 // 5 seconds

const POTION_LENGTH_FOR_RESPAWN = Math.round(DIMENSIONS.map / (DIMENSION_QUADRANT * 5))

const POTION_INTERVAL_NEW = ONE_SECOND * 10 // 10 seconds

const POTION_MAX_LENGTH = POTION_LENGTH_FOR_RESPAWN * 6

const COOLDOWN_SHOOT = ONE_SECOND * 1 // 1 second

const COOLDOWN_HEALING = ONE_SECOND * 5 // 5 seconds

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
        xpForKillMultiplier: 1.5,
        xpForKill: 20,
        damage: 10,
        criticalDamage: 10,
        hp: 100,
        healingCure: 10,
        defense: 100,
        speedMaster: SPEED_PLAYER_MASTER,
        timeCooldownShoot: COOLDOWN_SHOOT,
        timeCooldownHealing: COOLDOWN_HEALING,
        timeHealingBetween: ONE_SECOND,
        healingTime: ONE_SECOND * 5 // 5 seconds
    },
    enemies: {
        lengthForRespawn: (playersLength: number) => {
            return playersLength * ENEMY_LENGTH_SPAWN_INTERVAL_FOR_PLAYER
        },
        lengthMax: (playersLength: number) => {
            return playersLength * ENEMY_LENGTH_FOR_PLAYER
        },
        intervalNew: ENEMY_INTERVAL_NEW,
        types: [
            { damage: 20, criticalDamage: 15, range: 800, hp: 50, dimension: { width: 25, height: 25 }, speed: SPEED_ENEMY_MASTER_INITIAL + 2, color: "", tx: 67 },
            { damage: 30, criticalDamage: 20, range: 1000, hp: 100, dimension: { width: 35, height: 35 }, speed: SPEED_ENEMY_MASTER_INITIAL + 1, color: "", tx: 92 },
            { damage: 50, criticalDamage: 25, range: 1100, hp: 150, dimension: { width: 50, height: 50 }, speed: SPEED_ENEMY_MASTER_INITIAL, color: "", tx: 97 },
            { damage: 75, criticalDamage: 30, range: 1200, hp: 200, dimension: { width: 60, height: 60 }, speed: SPEED_ENEMY_MASTER_INITIAL - 1, color: "", tx: 100 },
        ],
        damage: 10,
        criticalDamage: 10,
        hp: 100,
        speedMaster: SPEED_ENEMY_MASTER_INITIAL,
    },
    projectile: {
        size: (valuePU: number) => {
            return valuePU > 0 ?
                PROJECTILE_SIZE + (Math.round(PROJECTILE_SIZE / LENGTH_UPGRADES_PU) * valuePU)
                : PROJECTILE_SIZE
        },
        speed: (valuePU: number) => {
            return valuePU > 0 ?
                PROJECTILE_SPEED + (Math.round((PROJECTILE_SPEED * 2) / LENGTH_UPGRADES_PU) * valuePU)
                : PROJECTILE_SPEED
        }
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
            { dimension: { width: 10, height: 10 }, value: 2, color: "", tx: 42 },
            { dimension: { width: 10, height: 10 }, value: 2, color: "", tx: 67 },
            { dimension: { width: 10, height: 10 }, value: 2, color: "", tx: 82 },
            { dimension: { width: 15, height: 15 }, value: 5, color: "", tx: 92 },
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
            projectileSpeed: Math.round((PROJECTILE_SPEED * 2) / LENGTH_UPGRADES_PU),
            projectileSize: Math.round((PROJECTILE_SIZE * 3) / LENGTH_UPGRADES_PU),
            projectileDamage: 5,
            projectileCooldown: Math.round((COOLDOWN_SHOOT / 2) / LENGTH_UPGRADES_PU),
        }
    }
}
