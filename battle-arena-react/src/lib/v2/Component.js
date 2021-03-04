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

export function FromSchema(schema, argObj = {}) {
    //? There should only ever be ONE (1) entry in a component schema, thus .values not .entries
    for(let value of Object.values(schema)) {
        if(typeof value === "function") {
            const obj = { ...argObj };
            for(let [ k, v ] of Object.entries(obj)) {
                if(typeof v === "function") {
                    obj[ k ] = v();
                }
            }

            return Component.Factory(value(obj));
        } else {
            return Component.Factory(value);
        }
    }
}

Component.Factory = Factory;
Component.FromSchema = FromSchema;

export default Component;