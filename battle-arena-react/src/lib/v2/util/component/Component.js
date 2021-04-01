import Agency from "@lespantsfancy/agency";

export class Component extends Agency.Event.Emitter {
    static Name = "component";
    static DefaultProperties = () => ({});

    constructor(name, game, entity, state = {}) {
        super();

        this.__name = name;
        
        this.__game = game;
        this.__entity = entity;

        this.__merge(state);
    }

    __merge(state = {}) {
        for(let [ key, value ] of Object.entries(state)) {
            if(typeof value === "function") {
                this[ key ] = value(this.game, this.entity);
            } else {
                this[ key ] = value;
            }
        }

        return this;
    }

    get name() {
        return this.__name;
    }
    get game() {
        return this.__game;
    }
    get entity() {
        return this.__entity;
    }
}

export function FromSchema(game, entity, schema, argObj = {}) {
    const [ value ] = Object.values(schema);

    if(typeof value === "function") {
        const obj = { ...argObj };
        for(let [ k, v ] of Object.entries(obj)) {
            if(typeof v === "function") {
                obj[ k ] = v();
            }
        }

        return value(obj);
    } else {
        return value;
    }
}

Component.FromSchema = FromSchema;

export default Component;