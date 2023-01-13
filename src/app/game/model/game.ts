import { IId } from "../../../database/index.js";
import { IMap } from "./map.js";
import { IPlayer } from "./player.js";
import { IXp } from "./xp.js";

export interface IServer {
    _id: IId
    players: IPlayer[]
    map: IMap
    xps: IXp[]
}

export interface IGame {
    servers: IServer[]
}