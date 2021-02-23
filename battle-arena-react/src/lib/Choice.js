
import Agency from "@lespantsfancy/agency";

export default class Choice {
    constructor(proposition, { onTrue, onFalse } = {}) {
        this._proposition = new Agency.Proposition(proposition);
        this.onTrue = onTrue;
        this.onFalse = onFalse;
    }

    get proposition() {
        return this._proposition;
    }
    set proposition(input) {
        if(input instanceof Agency.Proposition) {
            this._proposition = input;
        } else if(typeof input === "function") {
            this._proposition = new Agency.Proposition(input);
        }
    }

    T(fn) {
        this.onTrue = fn;

        return this;
    }
    F(fn) {
        this.onFalse = fn;

        return this;
    }

    run(...args) {
        if(this.proposition.run(...args) === true) {
            if(this.onTrue instanceof Choice) {
                return this.onTrue.run(...args);
            } else if(typeof this.onTrue === "function") {
                return this.onTrue(...args);
            }

            return true;
        }

        if(this.onFalse instanceof Choice) {
            return this.onFalse.run(...args);
        } else if(typeof this.onFalse === "function") {
            return this.onFalse(...args);
        }

        return false;
    }

    static FromSchema(schema = {}) {
        const choice = new Choice();

        if(typeof schema.proposition === "object") {
            choice.proposition = Choice.FromSchema(schema.proposition);
        } else {
            choice.proposition = schema.proposition;
        }

        choice.onTrue = schema.onTrue;        
        choice.onFalse = schema.onFalse;        
    }

    // static Get(choice, key) {
    //     if(choice instanceof Choice) {
    //         const props = key.split(".");

    //         if(props[ 0 ] === "$") {
    //             return Choice.Get(choice, key);
    //         }

    //         for(let prop of props) {
    //             if(prop === "T" || prop === "t") {
    //                 return 
    //             }
    //         }
    //     }
    // }
}


// extends Agency.Proposition {
//     constructor(...evaluators) {
//         super(...evaluators);
//     }
// }