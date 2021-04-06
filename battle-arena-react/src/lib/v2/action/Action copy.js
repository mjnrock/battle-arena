import Agency from "@lespantsfancy/agency";

export class Action extends Agency.Mutator {
    constructor(filter, ...effects) {
        super(effects, filter);
    }

    perform(source, selectionArgs = [], applyArgs = [], entities = {}) {
        const selected = this.qualify(entities, ...selectionArgs);
        
        return this.apply(selected, source, ...applyArgs);
    }

    qualify(arr = [], ...args) {
        const res = [];
        if(this.__proposition) {
            for(let value of arr) {
                if(this.__proposition.test(value, ...args) === true) {
                    res.push(value);
                }
            }
        }

        return res;
    }
    apply(arr = [], ...args) {
        const res = [];
        for(let value of arr) {
            for(let fn of this.__methods) {
                if(typeof fn === "function") {
                    res.push(fn(value, ...args));
                } else if(fn instanceof Agency.Mutator) {
                    res.push(fn.mutate(value, value, ...args));
                }
            }
        }

        return res;
    }
}

export function Factory(filter, ...effects) {
    return new Action(filter, ...effects);
}
export function Spawn(source, filter, effects = [], entities = [], selectionArgs = [], applyArgs = []) {
    if(!Array.isArray(effects)) {
        effects = [ effects ];
    }
    if(!Array.isArray(entities)) {
        entities = [ entities ];
    }

    const action = Factory(filter, ...effects);
    
    return action.perform(source, selectionArgs, applyArgs, entities);
}

Action.Factory = Factory;
Action.Spawn = Spawn;

export default Action;