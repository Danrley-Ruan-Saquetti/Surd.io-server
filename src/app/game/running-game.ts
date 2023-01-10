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
        let intervalGame: NodeJS.Timer
        let intervalXp: NodeJS.Timer

        const initComponents = () => {
            try {
                intervalGame = setInterval(update, RULES_GAME.game.FPS)
                intervalXp = setInterval(() => gameControl.createXp(idServer), RULES_GAME.xps.intervalNew)
            } catch (err) {
                console.log(err);
                clearInterval(intervalGame)
                clearInterval(intervalXp)
            }
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