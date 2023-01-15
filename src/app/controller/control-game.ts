import { IId } from "../../database/index.js"
import { RULES_GAME } from "../business-rule/rules.js"
import dataGame from "../game/data/data-game.js"
import { IPlayer } from "../game/model/player.js"
import { ioEmit } from "../io/io.js"
import { IUser } from "../model/model-user.js"
import { validToken } from "../util/token.service.js"
import PlayerControl from "./control-player.js"
import XpControl from "./control-xp.js"

export default function GameControl() {
    const playerControl = PlayerControl()
    const xpControl = XpControl()

    const verifyCollision = ({ position: { x: x1, y: y1 }, dimension: { width: w1, height: h1 } }: { position: { x: number, y: number }, dimension: { width: number, height: number } }, { position: { x: x2, y: y2 }, dimension: { width: w2, height: h2 } }: { position: { x: number, y: number }, dimension: { width: number, height: number } }) => {
        return ((x1 >= x2 && x1 <= x2 + w2 && y1 >= y2 && y1 <= y2 + h2) ||
            (x1 + w1 >= x2 && x1 + w1 <= x2 + w2 && y1 >= y2 && y1 <= y2 + h2) ||
            (x1 + w1 >= x2 && x1 + w1 <= x2 + w2 && y1 + h1 >= y2 && y1 + h1 <= y2 + h2) ||
            (x1 <= x2 + w2 && x1 >= x2 && y1 + h1 >= y2 && y1 + h1 <= y2 + h2))
    }

    const calculateDistance = ({ position: { x: x1, y: y1 }, dimension: { width: w1, height: h1 } }: { position: { x: number, y: number }, dimension: { width: number, height: number } }, { position: { x: x2, y: y2 }, dimension: { width: w2, height: h2 } }: { position: { x: number, y: number }, dimension: { width: number, height: number } }) => {
        const point1 = { x: x1 + (w1 / 2), y: y1 + (h1 / 2) }
        const point2 = { x: x2 + (w2 / 2), y: y2 + (h2 / 2) }

        const bounds = { width: point1.x - point2.x, height: point1.y - point2.y }

        const distance = Math.sqrt((bounds.width) ^ 2 + (bounds.height) ^ 2)

        return distance
    }

    // Data
    const getData = async ({ token, idSocket }: { token: String, idSocket: String }) => {
        const authValid = await validToken(token, idSocket)

        if (!authValid.user) { return null }

        const { user } = authValid

        const { player } = dataGame.getPlayer({ idServer: user.serverConnected || null, idSocket })

        return { data: { ...dataGame.getDataByServer({ _id: user.serverConnected || null }), powerUp: { lengthUpgradesPU: RULES_GAME.powerUp.lengthUpgradesPU } }, mapKeys: player?.mapKeys, ranking: user.serverConnected ? getRanking(user.serverConnected) : null }
    }

    const getRanking = (idServer: IId) => {
        const { players } = dataGame.getDataByServer({ _id: idServer })

        const ranking: IPlayer[] = []

        const validIdSocket = (idSocket: String) => {
            for (let i = 0; i < ranking.length; i++) {
                if (ranking[i].idSocket == idSocket) { return false }
            }
            return true
        }

        const chooseBest = (indexInitial: number, player: IPlayer) => {
            if (!validIdSocket(player.idSocket)) { return null }

            let best: IPlayer = player

            for (let i = indexInitial; i < players.length; i++) {
                const player = players[i]

                if (!validIdSocket(player.idSocket)) { continue }

                if (best.points > player.points) { continue }

                best = player
            }

            ranking.push(best)

            return best
        }

        for (let i = 0; i < players.length && i < RULES_GAME.ranking.listLength; i++) {
            const player = players[i]

            let best: IPlayer | null

            do {
                best = chooseBest(i + 1, player)
            } while (best && best.idSocket != player.idSocket);
        }

        return ranking
    }

    // Update
    const update = (idServer: IId) => {
        movePlayers({ idServer })
    }

    const verifyAll = (idServer: IId) => {
        verifyCollisionPlayerXp({ idServer })
    }

    const movePlayers = ({ idServer }: { idServer: IId }) => {
        const { players } = dataGame.getDataByServer({ _id: idServer })

        for (let i = 0; i < players.length; i++) {
            const player = players[i]

            playerControl.updatePositionPlayer({ player })
        }
    }

    const verifyCollisionPlayerXp = ({ idServer }: { idServer: IId }) => {
        const { players, xps } = dataGame.getDataByServer({ _id: idServer })

        for (let i = 0; i < players.length; i++) {
            const player = players[i]

            for (let i = 0; i < xps.length; i++) {
                const xp = xps[i]

                if (verifyCollision(xp, player)) {
                    playerControl.playerSetXp({ player, value: xp.value })
                    xpControl.removeXp({ _id: xp._id, idServer })
                }
            }
        }
    }

    const updateRanking = (idServer: IId) => {
        const ranking = getRanking(idServer)

        ioEmit({ ev: "$/games/ranking", data: { ranking }, room: idServer })
    }

    // User
    const UserStartGame = ({ user, idServer = null }: { user: IUser, idServer?: IId }) => {
        const response = playerControl.createPlayer(user, idServer)

        return response
    }

    const UserQuitGame = ({ idSocket, idServer }: { idSocket: String, idServer: IId }) => {
        const responseRemove = playerControl.quitPlayer({ idSocket, idServer })

        return { valueOf: responseRemove }
    }

    // Player
    const movePlayer = (data: { idSocket: String, idServer: IId, data: { key: String, action: "keyUp" | "keyDown" } }) => {
        playerControl.movePlayer(data)
    }

    const upgradePU = (data: { idSocket: String, idServer: IId, powerUp: "damage" | "hp" | "defense" | "size" | "speed" | "projectileSpeed" | "projectileSize" | "criticalDamage" }) => {
        playerControl.playerUpgradePu(data)
    }

    // Xp
    const createXpSerial = (idServer: IId) => {
        for (let i = 0; i < RULES_GAME.xps.lengthForRespawn && dataGame.getDataByServer({ _id: idServer }).xps.length < RULES_GAME.xps.maxLength; i++) {
            createXp(idServer)
        }
    }

    const createXp = (idServer: IId) => {
        return xpControl.createXp(idServer)
    }

    return {
        getData,
        getRanking,
        update,
        updateRanking,
        UserStartGame,
        UserQuitGame,
        movePlayer,
        upgradePU,
        createXpSerial,
        verifyAll,
    }
}