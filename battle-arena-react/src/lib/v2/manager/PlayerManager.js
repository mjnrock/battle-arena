// import Agency from "@lespantsfancy/agency";
import Agency from "./../util/agency/package";

export class PlayerManager extends Agency.Registry {
    constructor(players = []) {
        super(players);
    }
}

export default PlayerManager;