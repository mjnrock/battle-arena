import Agency from "@lespantsfancy/agency";
import Watchable from "./util/Watchable";

export class Component extends Watchable {
    constructor(state = {}, opts = {}) {
        super(state, { deep: false, ...opts });
    }
}

export function Factory(state = {}, opts) {
    return new Component(state, opts);
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