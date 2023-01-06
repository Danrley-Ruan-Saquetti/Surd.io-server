import { IId } from "../../../database/index.js"

export interface IPlayer {
    _id: IId
    level: Number
    health: Number
    maxHealth: Number
    xp: Number
    xpUpLevel: Number
    defense: Number
    coins: Number
    points: Number
    position: { x: Number, y: Number }
    speed: { x: Number, y: Number }
    speedMaster: Number
    dimension: { width: Number, height: Number }
    keysMove: { UP: Boolean, DOWN: Boolean, LEFT: Boolean, RIGHT: Boolean }
    lastKeyMove: { vertical: String, horizontal: String }
    upgradesPU: Number
    powerUps: { damage: Number, health: Number, defense: Number, size: Number, speed: Number }
}