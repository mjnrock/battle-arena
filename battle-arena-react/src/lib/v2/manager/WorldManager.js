import { v4 as uuidv4 } from "uuid";
import Registry from "./../util/Registry";

export class WorldManager extends Registry {
    constructor(game, { worlds = [] } = {}) {
        super(worlds);

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
        const player = this.game.players.player;
        
        if(player) {
            return this[ player.world.world ];
        }

        return this[ `overworld` ];
    }
}

export default WorldManager;