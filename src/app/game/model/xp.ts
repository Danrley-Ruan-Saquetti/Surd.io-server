import { IId } from "../../../database"

export interface IXp {
    _id: String
    idServer: IId
    position: { x: number, y: number }
    dimension: { width: number, height: number }
    value: Number
    level: Number
    color: String
}