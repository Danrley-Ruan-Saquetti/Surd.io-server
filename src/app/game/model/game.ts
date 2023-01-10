import { IId } from "../../../database/index.js";

export interface IServer {
    _id: IId
    players: any
    xps: any
}

export interface IGame {
    servers: any
}