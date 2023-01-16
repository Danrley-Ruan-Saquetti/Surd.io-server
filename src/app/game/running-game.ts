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
        let intervalPotion: NodeJS.Timer
        let intervalListRanking: NodeJS.Timer

        const initComponents = () => {
            try {
                intervalUpdate = setInterval(update, RULES_GAME.game.intervalUpdate)
                intervalFast = setInterval(verifyAll, RULES_GAME.game.intervalFast)
                intervalXp = setInterval(createXpSerial, RULES_GAME.xps.intervalNew)
                intervalPotion = setInterval(createPotionSerial, RULES_GAME.potions.intervalNew)
                intervalListRanking = setInterval(updateRanking, RULES_GAME.ranking.intervalUpdateListRanking)
            } catch (err) {
                console.log(err);
                clearInterval(intervalUpdate)
                clearInterval(intervalFast)
                clearInterval(intervalXp)
                clearInterval(intervalPotion)
                clearInterval(intervalListRanking)
            }
        }

        const verifyAll = () => {
            gameControl.verifyAll(idServer)
        }

        const update = () => {
            gameControl.update(idServer)
        }

        const createXpSerial = () => {
            gameControl.createXpSerial(idServer)
        }

        const createPotionSerial = () => {
            gameControl.createPotionSerial(idServer)
        }

        const updateRanking = () => {
            gameControl.updateRanking(idServer)
        }

        initComponents()
    }

    return {
        startGames
    }
}

const runningGame = RunningGame()

export default runningGame