export class Affliction {
    /**
     * Points should always be relative to the origin point
     *      and should follow [ x, y, { ignore, only } ] syntax,
     *      where @ignore and @only are: fn|
     */
    constructor(points = [], effects = []) {
        if(Array.isArray(points)) {
            this.points = points;
        } else {
            throw new Error("@points is not a valid option");
        }

        this.effects = effects;
    }

    /**
     * Flatten <Affliction> to a [ [ <Effect>[], x, y, { ignore, only } ], ... ] format, with
     *      optional origin point to make the relative positions absolute.
     * @ox | OPTIONAL | "Origin X" : Make the relative x coordinate absolute (e.g. entity.world.x)
     * @oy | OPTIONAL | "Origin Y" : Make the relative y coordinate absolute (e.g. entity.world.y)
     */
    flatten(ox = 0, oy = 0, ...args) {
        const arr = [];
        for(let point of this.points) {
            if(typeof point === "function") {
                point = point(ox, oy, ...args);
            }

            if(Array.isArray(point)) {
                let [ x, y, opts = { ignore: null, only: null } ] = point;
                arr.push([
                    this.effects,
                    x + ox,
                    y + oy,
                    opts, 
                ]);
            }
        }

        return arr;
    }
};

export default Affliction;