import { IId } from "../../../database/index.js"

export interface IPlayer {
    _id: IId
    idSocket: String
    idServer: IId
    username: String
    level: number
    damage: number
    criticalDamage: number
    hp: number
    hpMax: number
    healingCure: number
    xp: number
    fov: number
    xpUpLevel: number
    defense: number
    coins: number
    points: number
    contKills: number
    isPossibleShoot: Boolean
    isPossibleHealing: Boolean
    timeCooldownShoot: number
    timeCooldownHealing: number
    intervalHealingBetween?: NodeJS.Timeout
    intervalHealing?: NodeJS.Timeout
    position: { x: number, y: number }
    speed: { x: number, y: number }
    speedMaster: number
    dimension: { width: number, height: number }
    keysMove: { UP: Boolean, DOWN: Boolean, LEFT: Boolean, RIGHT: Boolean }
    lastKeyMove: { vertical: "UP" | "DOWN" | "", horizontal: "RIGHT" | "LEFT" | "" }
    mapKeys: { key: String, index: number }[]
    upgradesPU: number
    contAlreadyUpdatePU: number
    projectile: {
        speed: number
        size: number
        range: number
        reload: number
    }
    powerUps: {
        damage: number
        criticalDamage: number
        hp: number
        defense: number
        size: number
        speed: number
        projectileSpeed: number
        projectileSize: number
        projectileRange: number
        projectileReload: number
    }
}