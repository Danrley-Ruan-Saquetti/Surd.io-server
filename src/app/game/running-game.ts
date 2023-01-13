import { IId } from "../../database";
import { RULES_GAME } from "../business-rule/rules.js";
import GameControl from "../controller/control-game.js";
import ServerDao from "../model/dao-server.js";

function RunningGame() {
    const gameControl = GameControl()
    const serverDao = ServerDao()

    const startGames = async () => {
        const responseServers = await serverDao.list()

        if (responseServers.servers) {
            responseServers.servers.forEach(server => {
                runningGame({ idServer: server._id })
            })
        }
    }

    const runningGame = ({ idServer }: { idServer: IId }) => {
        let intervalUpdate: NodeJS.Timer
        let intervalFast: NodeJS.Timer
        let intervalXp: NodeJS.Timer

        const initComponents = () => {
            try {
                intervalUpdate = setInterval(update, RULES_GAME.game.intervalUpdate)
                intervalFast = setInterval(verifyAll, RULES_GAME.game.intervalFast)
                intervalXp = setInterval(() => {
                    for (let i = 0; i < RULES_GAME.xps.lengthForRespawn; i++) {
                        gameControl.createXp(idServer)
                    }
                }, RULES_GAME.xps.intervalNew)
            } catch (err) {
                console.log(err);
                clearInterval(intervalUpdate)
                clearInterval(intervalFast)
                clearInterval(intervalXp)
            }
        }

        const verifyAll = () => {
            gameControl.verifyAll(idServer)
        }

        const update = () => {
            gameControl.update(idServer)
        }

        initComponents()
    }

    return {
        startGames
    }
}

const runningGame = RunningGame()

export default runningGame