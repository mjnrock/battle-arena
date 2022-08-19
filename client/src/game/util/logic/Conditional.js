import Proposition from "./Proposition";

export class Conditional {
    constructor(prop, fn) {
        this.antecedent = prop;
        this.consequent = fn;
    }

    test(...args)  {
        if(typeof this.antecedent === "function" && this.antecedent(...args) === true) {
            return true;
        } else if(this.antecedent instanceof Proposition && this.antecedent.test(...args) === true) {
            return true;
        }

        return false;
    }
    attempt(ifArgs = [], thenArgs = []) {
        if(this.test(...ifArgs) === true) {
            return this.consequent(...thenArgs);
        }
    }

    toObject() {
        let obj = {
            antecedent: this.antecedent,
            consequent: this.consequent,
        };

        return obj;
    }
    toJson() {
        let obj = {
            antecedent: this.antecedent,
            consequent: this.consequent,
        };

        return JSON.stringify(obj, (key, value) => {
            if(key === "consequent") {
                return value.toString();
            }

            return value;
        });
    }

    static FromObject(obj = {}) {
        if(typeof obj.consequent === "string" || obj.consequent instanceof String) {
            obj.consequent = eval(obj.consequent);
        }
        
        if(obj.antecedent instanceof Proposition) {
            return new Conditional(obj.antecedent, obj.consequent);
        }

        return new Conditional(
            Proposition.FromObject(obj.antecedent),
            obj.consequent,
        );
    }
    static FromJson(json = "") {
        try {
            let obj = json;
            while(typeof obj === "string" || obj instanceof String) {
                obj = JSON.parse(obj);
            }

            return Conditional.FromObject(obj);
        } catch(e) {
            console.log(e)
            return false;
        }
    }
};

export default Conditional;