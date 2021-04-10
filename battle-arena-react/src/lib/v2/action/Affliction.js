import Effect from "./Effect";

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

        if(!Array.isArray(effects[ 0 ])) {
            effects = [ effects ];
        }

        this.effects = [];
        for(let [ fn, ...args ] of effects) {
            this.effects.push(new Effect(fn, ...args));
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
            let [ x, y, qualifier ] = point;

            arr.push([
                qualifier || (() => true),
                x,
                y,
                this.effects,
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





    static Caster(effects = [], qualifier) {
        return new Affliction([ 0, 0 ], effects, qualifier);
        // return new Affliction([ 0, 0 ], effects, ({ target, source }) => target === source);
    }
    static Facing(tiles = 1, effects = [], qualifier) {
        const lookup = {
            0: [ 0, -1 ],    
            180: [ 0, 1 ],   
            90: [ 1, 0 ],
            270: [ -1, 0 ],
        };

        return new Affliction(entity => {
            const points = [];
            const [ x, y ] = lookup[ +entity.world.facing ];

            points.push([ x, y ]);

            for(let i = 1; i < tiles; i++) {
                points.push([ x * i, y * i ]);
            }

            return points;
        }, effects, qualifier);
    }
    
    static Surround4(effects = [], qualifier) {
        return new Affliction([
            [ 1, 0 ],
            [ -1, 0 ],
            [ 0, 1 ],
            [ 0, -1 ],
        ], effects, qualifier);
    }
    static Surround8(effects = [], qualifier) {
        return new Affliction([
            [ 1, 0 ],
            [ -1, 0 ],
            [ 0, 1 ],
            [ 0, -1 ],
            
            [ 1, 1 ],
            [ 1, -1 ],
            [ -1, 1 ],
            [ -1, -1 ],
        ], effects, qualifier);
    }
    static Rectangle(xr, yr, effects = [], qualifier, { filled = true, ...opts } = {}) {
        const points = [];

        if(filled) {
            for(let x = -xr; x <= xr; x++) {
                for(let y = -yr; y <= yr; y++) {
                    points.push([ x, y ]);
                }
            }
        } else {
            for(let x = -xr; x <= xr; x++) {
                points.push([ x, yr ]);
                points.push([ x, -yr ]);
            }
            for(let y = -yr; y <= yr; y++) {
                points.push([ xr, y ]);
                points.push([ -xr, y ]);
            }
        }

        return new Affliction(points, effects, qualifier);
    }
    static Shape(shape, effects = [], qualifier) {
        //TODO
    }
};

export default Affliction;