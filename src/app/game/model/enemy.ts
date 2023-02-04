import { IId } from "../../../database"

export interface IEnemy {
    _id: String
    idServer: IId
    target: String | null
    targetRange: number
    isAvailableFollow: boolean
    damage: number
    criticalDamage: number
    hp: number
    hpMax: number
    position: { x: number, y: number }
    speed: { x: number, y: number }
    speedMaster: number
    dimension: { width: number, height: number }
    level: number
    color: String
}