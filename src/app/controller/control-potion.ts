import { IId } from "../../database/index.js"
import { RULES_GAME } from "../business-rule/rules.js"
import dataGame from "../game/data/data-game.js"
import { IPotion } from "../game/model/potion.js"
import { ioEmit } from "../io/io.js"
import generatedId from "../util/generatedId.js"

export default function PotionControl() {

    // Data
    const addPotion = ({ potion, idServer }: { potion: IPotion, idServer: IId }) => {
        const response = dataGame.addPotion({ potion, idServer })

        if (response) {
            ioEmit({ ev: "$/games/potions/create", data: { potion }, room: idServer })
        }

        return response
    }

    const removePotion = ({ _id, idServer }: { _id: String, idServer: IId }) => {
        const response = dataGame.removePotion({ _id, idServer })

        if (response) {
            ioEmit({ ev: "$/games/potions/remove", data: { potion: { _id } }, room: idServer })
        }

        return response
    }

    // Use Case
    const createPotion = (idServer: IId) => {
        const indexValue = {
            value: Math.round(Math.random() * 100),
            index: -1
        }

        for (let i = 0; i < RULES_GAME.potions.types.length; i++) {
            const potion = RULES_GAME.potions.types[i];

            if (indexValue.value <= potion.tx || i == RULES_GAME.potions.types.length - 1) {
                indexValue.index = i
                break
            }
        }

        const potionLevel = RULES_GAME.potions.types[indexValue.index]

        const potion: IPotion = {
            _id: generatedId(),
            idServer,
            dimension: potionLevel.dimension,
            value: potionLevel.value,
            position: { x: Math.random() * (RULES_GAME.map.dimension.width - potionLevel.dimension.width) + 1, y: Math.random() * (RULES_GAME.map.dimension.height - potionLevel.dimension.height) + 1 },
            level: indexValue.index,
            color: potionLevel.color
        }

        return { potion, valueOf: addPotion({ potion, idServer }) }
    }

    return {
        createPotion,
        removePotion,
    }
}