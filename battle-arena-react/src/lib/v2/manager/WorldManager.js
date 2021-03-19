import { v4 as uuidv4 } from "uuid";
import Agency from "@lespantsfancy/agency";

import Registry from "./../util/Registry";

export class WorldManager extends Registry {
    constructor(game) {
        super();

        this.__id = uuidv4();
        this.__game = game;
    }

    get id() {
        return this.__id;
    }
    get game() {
        return this.__game;
    }

    get current() {
        if(this.game) {
            const player = this.game.players.get(0);
            
            if(player) {
                return this[ player.position.world ];
            }
        }

        return this[ `overworld` ];
    }
}

export default WorldManager;