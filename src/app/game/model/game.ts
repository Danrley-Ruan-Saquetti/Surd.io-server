import { IId } from "../../../database/index.js";
import { IPlayer } from "./player.js";

export interface IServer {
    _id: IId
    players: any
}

export interface IGame {
    servers: any
}