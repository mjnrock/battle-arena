export class CrossMap {
    constructor(dimensions = [], { seedFn } = {}) {
        this.__entries = new Map();
        this.__lookups = [];

        for(let entry of dimensions[ 0 ]) {
            this.seed(this.__entries, entry, dimensions.slice(1), seedFn);
        }
    }

    addLookup(fn) {
        this.__lookups.push(fn);

        return this;
    }
    setLookup(index, fn) {
        this.__lookups[ index ] = fn;

        return this;
    }
    getLookup(index) {
        return this.__lookups[ index ];
    }
    reorderLookup(i1, i2) {
        const temp = this.getLookup(i1);

        this.setLookup(i1, this.getLookup(i2));
        this.setLookup(i2, temp);

        return this;
    }

    __dive(...args) {
        if(args.length === 1 && !Array.isArray(args[ 0 ])) {
            let coords = [];
            for(let fn of this.__lookups) {
                coords.push(fn(args[ 0 ]));
            }

            return this.get(...coords);
        }
        
        let coords = [];
        for(let i = 0; i < this.__lookups.length; i++) {
            const fn = this.__lookups[ i ];

            if(Array.isArray(args[ i ])) {
                coords.push(fn(...args[ i ]));
            } else {
                coords.push(fn());
            }
        }

        return this.get(...coords);
    }
    get(...coords) {
        if(typeof coords[ 0 ] === "object") {
            return this.__dive(coords[ 0 ]);
        }

        let result = this.__entries;
        for(let coord of coords) {
            if(result instanceof Map) {
                result = result.get(coord);
            }
        }

        return result;
    }

    __setDive(value, ...args) {
        if(args.length === 1 && !Array.isArray(args[ 0 ])) {
            let coords = [];
            for(let fn of this.__lookups) {
                coords.push(fn(args[ 0 ]));
            }

            return this.set(value, ...coords);
        }
        
        let coords = [];
        for(let i = 0; i < this.__lookups.length; i++) {
            const fn = this.__lookups[ i ];

            if(Array.isArray(args[ i ])) {
                coords.push(fn(...args[ i ]));
            } else {
                coords.push(fn());
            }
        }

        return this.set(value, ...coords);
    }
    set(value, ...coords) {
        if(typeof coords[ 0 ] === "object") {
            return this.__setDive(value, coords[ 0 ]);
        }

        const map = this.get(...coords.slice(0, coords.length - 1));

        map.set(coords[ coords.length - 1 ], value);

        return this;
    }

    seed(base, value, dimensions, seedFn) {
        if(Array.isArray(dimensions[ 0 ])) {
            const map = new Map();
            base.set(value, map);

            for(let entry of dimensions[ 0 ]) {
                this.seed(map, entry, dimensions.slice(1), seedFn);
            }
        } else if(base instanceof Map) {
            if(typeof seedFn === "function") {
                base.set(value, seedFn(base, value, dimensions));
            } else {
                base.set(value, null);
            }
        }

        return base;
    }

    toArray(rootMap) {
        if(rootMap === void 0) {
            rootMap = this.__entries;
        }

        let arr = [];
        for(let [ key, value ] of rootMap.entries()) {
            if(value instanceof Map) {
                arr.push(this.toArray(value));
            } else {
                arr.push(value);
            }
        }

        return arr;
    }
    toObject(rootMap) {
        if(rootMap === void 0) {
            rootMap = this.__entries;
        }

        let obj = {};
        for(let [ key, value ] of rootMap.entries()) {
            if(value instanceof Map) {
                obj[ key ] = this.toObject(value);
            } else {
                obj[ key ] = value;
            }
        }

        return obj;
    }
}

export default CrossMap;