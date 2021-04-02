import Agency from "@lespantsfancy/agency";

export class ComponentPackage {
    constructor(...props) {
        this.props = props;
    }
}

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

    /**
     * Helper function to invoke a class via the FromSchema paradigm.
     * This ensures seed functions are executed properly.
     */    
    //  A accessibility function to safely get an args key
    static ArgsKey = "args";
    static GetArgsKey = (state, key) => (((state || {})[ Component.ArgsKey ] || {})[ key ]);
    static Invoke(target, args = []) {
        return new target(...args.map(param => {                    
            if(typeof param === "function") {
                return param(this.game, this.entity);
            } else {
                return param;
            }
        }));
    }
    __merge(state = {}) {
        for(let [ key, value ] of Object.entries(state)) {
            if(key !== Component.ArgsKey) {
                if(typeof value === "function") {
                    this[ key ] = value(this.game, this.entity);
                } else {
                    this[ key ] = value;
                }
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

    onPreTick(spf, now) {}
    onTick(dt, now) {}
    onDraw(dt, now) {}

    static Has(entity) {
        return this.Name in entity;     // @this is the constructor in static methods and *does* appropriately descend to ancestors
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