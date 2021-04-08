/**
 * An <Affliction> will apply *every* <Effect>
 *  to *every* <Point> within it.
 */
export class Affliction {
    /**
     * @qualifier Should only qualify entities at a relational/existential level only
     */
    constructor(points = [], effects = [], qualifier) {
        if(typeof points === "function") {
            this.points = points;
        } else if(Array.isArray(points)) {
            if(!Array.isArray(points[ 0 ])) {
                this.points = [ points ];
            } else {
                this.points = points;
            }
        }

        if(!Array.isArray(effects)) {
            this.effects = [ effects ];
        } else {
            this.effects = effects;
        }

        if(typeof qualifier === "function") {
            this.qualifier = qualifier;
        } else {
            this.qualifier = () => true;
        }
    }

    flatten(...args) {
        const arr = [];
        const points = typeof this.points === "function" ? this.points(...args) : this.points;

        for(let point of points) {
            let [ x, y, opts = { ignore: null, only: null } ] = point;

            arr.push([
                this.effects,
                x,
                y,
                opts, 
            ]);
        }

        return arr;
    }

    static Flatten(afflictions = [], ...args) {
        let results = [];
        for(let affliction of afflictions) {
            if(affliction instanceof Affliction) {
                results.push(affliction.flatten(...args));
            }
        }

        return results;
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