import Agency from "@lespantsfancy/agency";

export class Component extends Agency.Context {
    constructor(opts = {}) {
        super(opts);
    }
}

export function Factory(state = {}, opts) {
    const comp = new Component(opts);

    for(let [ key, value ] of Object.entries(state)) {
        comp[ key ] = value;
    }

    return comp;
}

/**
 * If a schema returns an object, this assumes it to be state
 * If a schema returns an array, it assumes it to be Factory() args
 */
export function FromSchema(obj, ...args) {
    for(let [ key, value ] of Object.entries(obj)) {
        let nv;
        if(typeof value === "function") {
            nv = value(...args);
        } else {
            nv = value;
        }

        if(Array.isArray(nv)) {
            return Component.Factory(...nv);
        }

        return Component.Factory(nv);
    }
}

Component.Factory = Factory;
Component.FromSchema = FromSchema;

export default Component;