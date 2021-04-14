import World from "./World";

export class Arena extends World {
    constructor(size = [], opts = {}) {
        super(size, opts);
    }

    onPreTick(spf, now) {
        super.onPreTick(spf, now);
    }
    onTick(dt, now) {
        super.onTick(dt, now);
    }
};

export function CreateRandom(game, width, height) {
    const arena = new Arena([ width, height ], { game });

    return arena;
}

Arena.CreateRandom = CreateRandom;

export default Arena;