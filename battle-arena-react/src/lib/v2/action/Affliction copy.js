/**
 * An <Affliction> will apply *every* <Effect>
 *  to *every* <Point> within it.
 */
export class Affliction {
    /**
     * Points should always be relative to the origin point
     *      and should follow [ x, y, { ignore, only } ] syntax,
     *      where @ignore and @only are: fn
     */
    constructor(points = [], effects = []) {
        if(Array.isArray(points)) {
            if(!Array.isArray(points[ 0 ])) {
                this.points = [ points ];
            } else {
                this.points = points;
            }
        } else if(typeof points === "function") {
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
        const points = typeof this.points === "function" ? this.points(...args) : this.points;

        for(let point of points) {
            if(typeof point === "function") {
                point = point(...args);
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

    static Generate(...args) {
        if(args[ 0 ] instanceof Affliction) {
            const affliction = args[ 0 ];

            return new Affliction(affliction.points, affliction.effects);
        }

        return new Affliction(...args);
    }
    

    static Caster(effects = [], opts = {}) {
        return new Affliction([ 0, 0, opts ], effects);
    }
    static Facing(tiles = 1, effects = [], opts = {}) {
        const lookup = {
            0: [ 0, -1 ],    
            180: [ 0, 1 ],   
            90: [ 1, 0 ],
            270: [ -1, 0 ],
        };

        return new Affliction(entity => {
            const points = [];
            const [ x, y ] = lookup[ +entity.world.facing ];

            points.push([ x, y, opts ]);

            for(let i = 1; i < tiles; i++) {
                points.push([ x * i, y * i, opts ]);
            }

            return points;
        }, effects);
    }
    static Surround4(effects = [], opts = {}) {
        return new Affliction([
            [ 1, 0, opts ],
            [ -1, 0, opts ],
            [ 0, 1, opts ],
            [ 0, -1, opts ],
        ], effects);
    }
    static Surround8(effects = [], opts = {}) {
        return new Affliction([
            [ 1, 0, opts ],
            [ -1, 0, opts ],
            [ 0, 1, opts ],
            [ 0, -1, opts ],
            
            [ 1, 1, opts ],
            [ 1, -1, opts ],
            [ -1, 1, opts ],
            [ -1, -1, opts ],
        ], effects);
    }
    static Rectangle(xr, yr, effects = [], { filled = true, ...opts } = {}) {
        const points = [];

        if(filled) {
            for(let x = -xr; x <= xr; x++) {
                for(let y = -yr; y <= yr; y++) {
                    points.push([ x, y, opts ]);
                }
            }
        } else {
            for(let x = -xr; x <= xr; x++) {
                points.push([ x, yr, opts ]);
                points.push([ x, -yr, opts ]);
            }
            for(let y = -yr; y <= yr; y++) {
                points.push([ xr, y, opts ]);
                points.push([ -xr, y, opts ]);
            }
        }

        return new Affliction(points, effects);
    }
    static Shape(shape, effects = [], opts = {}) {
        //TODO
    }
};

export default Affliction;