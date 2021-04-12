import AgencyBase from "@lespantsfancy/agency/src/AgencyBase";

export class Component extends AgencyBase {
    static Name = "component";
    static DefaultProperties = () => ({});

    constructor(name, game, entity, state = {}) {
        super();

        this.__name = name;
        
        this.__game = game;
        this.__entity = entity;

        this.__merge(state);
    }

    // Receive @component for internal switching; if needed for the event, pass it as normal in @args
    escalate(event, ...args) {
        this.entity.escalation(this, event, ...args);
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

    __destroy() {
        for(let key in this) {
            delete this[ key ];
        }

        this.__deconstructor();
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
    onTurn(dt, now) {}
    onDraw(dt, now) {}

    static Has(entity) {
        return this.Name in entity;     // @this is the constructor in static methods and *does* appropriately descend to ancestors
    }
}

export default Component;