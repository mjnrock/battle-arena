export class CrossMap {
    constructor(dimensions = [], { seedFn, saveFnInstead } = {}) {
        this.__entries = new Map();
        this.__lookups = [];

        this.__size = dimensions;

        this.seed({ dimensions, seedFn, saveFnInstead });
    }

    get size() {
        return this.__size;
    }
    get cardinality() {
        return this.size.reduce((a, v) => a * v, 1);
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

    replaceLookups(...fns) {
        this.__lookups = fns;

        return this;
    }

    __dive(...args) {
        if(args.length === 1 && typeof args[ 0 ] === "object") { // Assume "lookup" utilization
            let coords = [];
            for(let fn of this.__lookups) {
                coords.push(fn(args[ 0 ]));
            }

            return this.get(...coords);
        }
        
         // Assume @args are entries
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
        if(typeof coords[ 0 ] === "object") { // Assume "lookup" utilization
            return this.__dive(coords[ 0 ]);
        }

         // Assume @args are entries
        let result = this.__entries;
        for(let coord of coords) {
            if(result instanceof Map) {
                result = result.get(coord);
            }
        }

        return result;
    }

    __setDive(value, ...args) {
        if(args.length === 1 && typeof args[ 0 ] === "object") { // Assume "lookup" utilization
            let coords = [];
            for(let fn of this.__lookups) {
                coords.push(fn(args[ 0 ]));
            }

            return this.set(value, ...coords);
        }
        
         // Assume @args are entries
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
        if(typeof coords[ 0 ] === "object") { // Assume "lookup" utilization
            return this.__setDive(value, coords[ 0 ]);
        }

         // Assume @args are entries
        const map = this.get(...coords.slice(0, coords.length - 1));

        map.set(coords[ coords.length - 1 ], value);

        return this;
    }

    seed({ root, dimensions = [], chain = [], seedFn = null, saveFnInstead = false } = {}) {
        if(root === void 0) {
            root = this.__entries = new Map();
            chain = [];
        }

        for(let value of dimensions[ 0 ]) {
            if(dimensions.length > 1) {
                const map = new Map();
                root.set(value, this.seed({
                    root: map,
                    dimensions: dimensions.slice(1),
                    seedFn,
                    saveFnInstead,
                    chain: [ ...chain, value ]
                }));
            } else {
                if(typeof seedFn === "function" && !saveFnInstead) {
                    root.set(value, seedFn(...[ ...chain, value ]));
                } else {
                    root.set(value, seedFn);
                }
            }
        }

        return root;
    }

    toLeaf({ asObject = false, flatten = false, rootMap } = {}) {
        if(rootMap === void 0) {
            rootMap = this.__entries;
        } else if(typeof rootMap === "boolean") {
            asObject = rootMap;
            rootMap = this.__entries;
        }

        if(asObject) {
            let obj = {};
            for(let [ key, value ] of rootMap.entries()) {
                if(value instanceof Map) {
                    obj[ key ] = this.toLeaf({ asObject: true, rootMap: value });
                } else {
                    obj[ key ] = value;
                }
            }
    
            return obj;
        }

        let arr = [];
        for(let [ key, value ] of rootMap.entries()) {
            if(value instanceof Map) {
                const results = this.toLeaf({ asObject: false, rootMap: value });

                if(flatten) {
                    arr.push(...results);
                } else {
                    arr.push(results);
                }
            } else {
                arr.push(value);
            }
        }

        return arr;
    }
}

export function CreateGrid(dimLengths = [], opts = {}) {
    const dims = dimLengths.map(v => [ ...Array(v) ].map((v, i) => i));
    
    return new CrossMap(dims, opts);
}

CrossMap.CreateGrid = CreateGrid;

export default CrossMap;