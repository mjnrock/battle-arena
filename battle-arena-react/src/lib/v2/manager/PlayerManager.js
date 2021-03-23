import Agency from "@lespantsfancy/agency";

import Registry from "./../util/Registry";

export class PlayerManager extends Registry {
    constructor(players = []) {
        super(players);
    }
}

export default PlayerManager;