import Agency from "@lespantsfancy/agency";

export class Action extends Agency.Mutator {
    constructor(filter, ...effects) {
        super(effects, filter);
    }

    perform(entities = {}, selectionArgs = [], applyArgs = []) {
        const selected = this.select(entities, ...selectionArgs);
        
        this.apply(selected, ...applyArgs);
    }
    select(obj = {}, ...args) {
        const res = {};
        if(this.__proposition) {
            for(let [ key, value ] of Object.entries(obj)) {
                if(this.__proposition.test(key, value, ...args) === true) {
                    res[ key ] = value;
                }
            }
        }

        return res;
    }
    apply(obj = {}, ...args) {
        for(let [ key, value ] of Object.entries(obj)) {
            for(let fn of this.__methods) {
                obj[ key ] = fn(key, value, ...args);
            }
        }

        return obj;
    }




    // perform(entities = [], selectionArgs = [], applyArgs = []) {
    //     const selected = this.select(entities, ...selectionArgs);
        
    //     this.apply(selected, ...applyArgs);
    // }

    // select(arr = [], ...args) {
    //     const res = [];
    //     if(this.__proposition) {
    //         for(let entry of arr) {
    //             if(this.__proposition.test(entry, ...args) === true) {
    //                 res.push(entry);
    //             }
    //         }
    //     }

    //     return res;
    // }
    // apply(arr = [], ...args) {
    //     for(let entry of arr) {
    //         for(let fn of this.__methods) {
    //             entry = fn(entry, ...args);
    //         }
    //     }

    //     return arr;
    // }
}

export default Action;