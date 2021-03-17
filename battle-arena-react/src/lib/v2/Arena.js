import World from "./World";

export class Arena extends World {
    constructor(overworld, width, height) {
        super(width, height)

        this.__overworld = overworld;
    }

    get overworld() {
        return this.__overworld;
    }
};

export default Arena;