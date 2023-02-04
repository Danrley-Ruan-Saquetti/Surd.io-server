import { IId } from "../../../database/index.js";
import { IEnemy } from "../model/enemy.js";
import { IGame, IServer } from "../model/game.js";
import { IPlayer } from "../model/player.js";
import { IPotion } from "../model/potion.js";
import { IProjectile } from "../model/projectile.js";
import { IXp } from "../model/xp.js";

function DataGame() {
    const games: IGame = { servers: [] }
    const indexes: any = {}

    // Data
    const getDataByServer = ({ _id }: { _id: IId }) => {
        const data = games.servers[indexes[`${_id}`]]

        return data
    }

    const getData = () => {
        return games
    }

    // Game
    const addGame = (game: IServer) => {
        indexes[`${game._id}`] = games.servers.length
        games.servers.push(game)
    }

    // Player
    const getPlayer = ({ idSocket, idServer }: { idSocket: String, idServer: IId }) => {
        const response: { player: IPlayer | null, index: number } = (function () {
            for (let i = 0; i < getDataByServer({ _id: idServer }).players.length; i++) {
                const player = getDataByServer({ _id: idServer }).players[i];

                if (player.idSocket != idSocket) { continue }

                return { player, index: i }
            }

            return { player: null, index: -1 }
        }())

        return response
    }

    const addPlayer = ({ player, idServer }: { player: IPlayer, idServer: IId }) => {
        try {
            games.servers[indexes[`${idServer}`]].players.push(player)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const removePlayer = ({ idSocket, idServer }: { idSocket: String, idServer: IId }) => {
        try {
            const { index } = getPlayer({ idServer, idSocket })

            if (index == -1) { return false }

            games.servers[indexes[`${idServer}`]].players.splice(index, 1)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const updatePlayer = ({ player }: { player: IPlayer }) => {
        try {
            games.servers[indexes[`${player.idServer}`]].players[getPlayer({ idSocket: player.idSocket, idServer: player.idServer }).index] = player

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    // Xp
    const getXp = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        const response: { xp: IXp | null, index: number } = (function () {
            for (let i = 0; i < games.servers[indexes[`${idServer}`]].xps.length; i++) {
                const xp = games.servers[indexes[`${idServer}`]].xps[i];

                if (xp._id != _id) { continue }

                return { xp, index: i }
            }

            return { xp: null, index: -1 }
        }())

        return response
    }

    const addXp = ({ xp, idServer }: { xp: IXp, idServer: IId }) => {
        try {
            games.servers[indexes[`${idServer}`]].xps.push(xp)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const removeXp = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        try {
            const { index } = getXp({ idServer, _id })

            if (index == -1) { return false }

            games.servers[indexes[`${idServer}`]].xps.splice(index, 1)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    // Potion
    const getPotion = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        const response: { potion: IPotion | null, index: number } = (function () {
            for (let i = 0; i < games.servers[indexes[`${idServer}`]].potions.length; i++) {
                const potion = games.servers[indexes[`${idServer}`]].potions[i];

                if (potion._id != _id) { continue }

                return { potion, index: i }
            }

            return { potion: null, index: -1 }
        }())

        return response
    }

    const addPotion = ({ potion, idServer }: { potion: IPotion, idServer: IId }) => {
        try {
            games.servers[indexes[`${idServer}`]].potions.push(potion)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const removePotion = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        try {
            const { index } = getPotion({ idServer, _id })

            if (index == -1) { return false }

            games.servers[indexes[`${idServer}`]].potions.splice(index, 1)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    // Projectile
    const getProjectile = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        const response: { projectile: IProjectile | null, index: number } = (function () {
            for (let i = 0; i < games.servers[indexes[`${idServer}`]].projectiles.length; i++) {
                const projectile = games.servers[indexes[`${idServer}`]].projectiles[i];

                if (projectile._id != _id) { continue }

                return { projectile, index: i }
            }

            return { projectile: null, index: -1 }
        }())

        return response
    }

    const getProjectilesByPlayer = ({ idSocket, idServer }: { idSocket: String, idServer: IId }) => {
        const projectiles: IProjectile[] = dataGame.getDataByServer({ _id: idServer }).projectiles.filter(p => { return p.idSocket == idSocket })

        return { projectiles }
    }

    const addProjectile = ({ projectile, idServer }: { projectile: IProjectile, idServer: IId }) => {
        try {
            games.servers[indexes[`${idServer}`]].projectiles.push(projectile)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const removeProjectile = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        try {
            const { index } = getProjectile({ idServer, _id })

            if (index == -1) { return false }

            games.servers[indexes[`${idServer}`]].projectiles.splice(index, 1)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    // Enemy
    const getEnemy = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        const response: { enemy: IEnemy | null, index: number } = (function () {
            for (let i = 0; i < games.servers[indexes[`${idServer}`]].enemies.length; i++) {
                const enemy = games.servers[indexes[`${idServer}`]].enemies[i];

                if (enemy._id != _id) { continue }

                return { enemy, index: i }
            }

            return { enemy: null, index: -1 }
        }())

        return response
    }

    const getEnemiesByPlayer = ({ idSocket, idServer }: { idSocket: String, idServer: IId }) => {
        const enemies: IEnemy[] = dataGame.getDataByServer({ _id: idServer }).enemies.filter(e => { return e.target == idSocket })

        return { enemies }
    }

    const addEnemy = ({ enemy, idServer }: { enemy: IEnemy, idServer: IId }) => {
        try {
            games.servers[indexes[`${idServer}`]].enemies.push(enemy)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const updateEnemy = ({ enemy }: { enemy: IEnemy }) => {
        try {
            games.servers[indexes[`${enemy.idServer}`]].enemies[getEnemy(enemy).index] = enemy

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    const removeEnemy = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        try {
            const { index } = getEnemy({ idServer, _id })

            if (index == -1) { return false }

            games.servers[indexes[`${idServer}`]].potions.splice(index, 1)

            return true
        } catch (err) {
            console.log(err);
            return false
        }
    }

    return {
        getData,
        getDataByServer,
        addGame,
        getPlayer,
        addPlayer,
        removePlayer,
        updatePlayer,
        getXp,
        addXp,
        removeXp,
        getPotion,
        addPotion,
        removePotion,
        getProjectile,
        getProjectilesByPlayer,
        addProjectile,
        removeProjectile,
        getEnemy,
        getEnemiesByPlayer,
        removeEnemy,
        updateEnemy,
        addEnemy,
    }
}

const dataGame = DataGame()

export default dataGame