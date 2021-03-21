import Agency from "@lespantsfancy/agency";

import Registry from "./../util/Registry";

export class PlayerManager extends Registry {
    constructor(players = []) {
        super({}, { deep: true });

        for(let i = 0; i < players.length; i++) {
            const player = players[ i ];
            
            this.register(player);
        }
    }
}

export default PlayerManager;