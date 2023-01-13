import { IId } from "../../../database"

export interface IXp {
    _id: String
    idServer: IId
    position: { x: number, y: number }
    dimension: { width: number, height: number }
    value: number
    level: number
    color: String
}