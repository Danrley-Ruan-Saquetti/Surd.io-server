import { IId } from "../../database"
import { RULES_GAME } from "../business-rule/rules.js"
import dataGame from "../game/data/data-game.js"
import { IXp } from "../game/model/xp"
import { ioEmit } from "../io/io.js"
import generatedId from "../util/generatedId.js"

export default function XpControl() {

    // Data
    const addXp = ({ xp, idServer }: { xp: IXp, idServer: IId }) => {
        const response = dataGame.addXp({ xp, idServer })

        if (response) {
            ioEmit({ ev: "$/games/xps/create", data: { xp }, room: idServer })
        }

        return response
    }

    const removeXp = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        const response = dataGame.removeXp({ _id, idServer })

        if (response) {
            ioEmit({ ev: "$/games/xps/remove", data: { xp: { _id } }, room: idServer })
        }

        return response
    }

    // Use Case
    const createXp = (idServer: IId) => {
        const indexValue = {
            value: Math.round(Math.random() * 100),
            index: -1
        }

        for (let i = 0; i < RULES_GAME.xps.types.length; i++) {
            const xp = RULES_GAME.xps.types[i];

            if (indexValue.value <= xp.tx || i == RULES_GAME.xps.types.length - 1) {
                indexValue.index = i
                break
            }
        }

        const xpLevel = RULES_GAME.xps.types[indexValue.index]

        const xp: IXp = {
            _id: generatedId(),
            idServer,
            dimension: { height: xpLevel.dimension.height, width: xpLevel.dimension.width },
            value: xpLevel.value,
            position: { x: Math.random() * (RULES_GAME.map.dimension.width - xpLevel.dimension.width) + 1, y: Math.random() * (RULES_GAME.map.dimension.height - xpLevel.dimension.height) + 1 },
            level: indexValue.index + 1,
            color: xpLevel.color
        }

        return { xp, valueOf: addXp({ xp, idServer }) }
    }

    return {
        removeXp,
        createXp,
    }
}