import Agency from "@lespantsfancy/agency";

export class PlayerManager extends Agency.Beacon {
    constructor(players = []) {
        super();

        this.__players = [];
    }

    add(player) {
        this.attach(player);
        this.__players.push(player);
    }

    get player() {
        return this.__players[ 0 ];
    }
}

export default PlayerManager;