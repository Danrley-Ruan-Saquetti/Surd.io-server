import { IId } from "../../../database/index.js";
import { IPlayer } from "./player.js";

export interface IServer {
    _id: IId
    players: IPlayer[]
}

export interface IGame {
    servers: IServer[]
}