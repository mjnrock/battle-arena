import Agency from "@lespantsfancy/agency";

import Registry from "./../util/Registry";

export class WorldManager extends Registry {
    constructor(game) {
        super();

        this.__game = game;
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