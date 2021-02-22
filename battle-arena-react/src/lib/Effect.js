export default class Effect {
    /**
     * This is functionally an abstract class, and should be treated as such
     * @param {fn(ea, target)} effect | What the Effect will do upon being invoked
     * @param {fn:bool} only [ 0 ] | A function that only affects true-result entities
     * @param {fn:bool} ignore [ 0 ] | A function that ignores true-result entities
     */
    constructor(effect, { only = 0, ignore = 0 } = {}) {;
        this.effect = effect;

        this.only = only;
        this.ignore = ignore;
    }

    /**
     * If needed, @ea.parent will be the entity that invoked the Action
     * @param {EntityAction} ea 
     * @param {Entity} entity 
     * @param  {...any} args 
     */
    affect(entity, ...args) {
        if(typeof this.only === "function") {
            if(this.only(entity, ...args) === true) {
                this.effect(entity, ...args);
            }
        } else if(typeof this.ignore === "function") {
            if(this.ignore(entity, ...args) === false) {
                this.effect(entity, ...args);
            }
        } else {
            this.effect(entity, ...args);
        }

        return this;
    }

    static FromSchema(schemaOrObj) {
        let effect = new Effect();
        for(let [ key, value ] of Object.entries(schemaOrObj)) {
            effect[ key ] = value;
        }
    
        return effect;
    }
};