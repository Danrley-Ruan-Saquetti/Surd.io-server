import { IId } from "../../../database"

export interface IProjectile {
    _id: String
    idSocket: String
    idServer: IId
    position: { x: number, y: number }
    speed: { x: number, y: number }
    size: number
    color: String
}