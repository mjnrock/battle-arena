import Registry from "@lespantsfancy/agency/src/Registry";
// import Agency from "./../util/agency/package";
// import Registry from "./../util/agency/Registry"
// import Registry from "./../util/Registry"

export class PlayerManager extends Registry {
    constructor(players = []) {
        super(players);
    }
}

export default PlayerManager;