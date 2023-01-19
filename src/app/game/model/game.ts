import { IId } from "../../../database/index.js";
import { IMap } from "./map.js";
import { IPlayer } from "./player.js";
import { IPotion } from "./potion.js";
import { IProjectile } from "./projectile.js";
import { IXp } from "./xp.js";

export interface IServer {
    _id: IId
    map: IMap
    players: IPlayer[]
    xps: IXp[]
    potions: IPotion[]
    projectiles: IProjectile[]
}

export interface IGame {
    servers: IServer[]
}