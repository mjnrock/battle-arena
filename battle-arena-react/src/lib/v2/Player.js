import Agency from "@lespantsfancy/agency";
import Watchable from "./util/Watchable";

//TODO Wrap the player's entity and use this class within PlayerManager
export class Player extends Watchable {
    constructor(entity) {
        super();

        this.entity = entity;
    }
}

export default Player;