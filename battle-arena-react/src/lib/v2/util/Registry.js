import { v4 as uuidv4, validate } from "uuid";

import Watchable from "./Watchable";

export class Registry extends Watchable {
    constructor(entries = [], state = {}, { deep = true } = {}) {
        super(state, { deep });

        for(let entry of entries) {
            if(Array.isArray(entry)) {
                this.register(...entry);
            } else {
                this.register(entry);
            }
        }

        this.__props = {
            size: 0,
        };
            
        return new Proxy(this, {
            get(target, prop) {
                if(!validate(prop) && validate(target[ prop ])) {   // prop is NOT a uuid AND target[ prop ] IS a uuid --> prop is a synonym
                    const entry = target[ target[ prop ] ];

                    if(entry !== void 0) {
                        return entry;
                    }
                }

                return target[ prop ];
            },
            set(target, prop, value) {
                if(validate(prop) || validate(value)) {
                    target[ prop ] = value;
                }
    
                return target;
            }
        });
    }

    get $() {
        const _this = this;

        return {
            ...super.$,

            async emit(prop, value) {
                if(validate(prop.substring(0, 36))) {
                    prop = prop.slice(37);
                }

                for(let subscriber of _this.__subscribers.values()) {
                    const payload = {
                        prop,
                        value,
                        subject: _this,
                        emitter: _this,
                        subscriber,
                    };
        
                    if(typeof subscriber === "function") {
                        subscriber.call(payload, prop, value);
                    } else if(subscriber instanceof Watchable) {
                        subscriber.$.emit.call(payload, prop, value);
                    }
                }
        
                return _this;
            },
        };
    }

    get size() {
        return this.__props.size;
    }

    get entries() {
        return Object.entries(this).reduce((a, [ k, v ]) => {
            if(validate(k)) {
                return [ ...a, [ k, v ] ];
            }

            return a;
        }, []);
    }
    get values() {
        return Object.entries(this).reduce((a, [ k, v ]) => {
            if(validate(k)) {
                return [ ...a, v ];
            }

            return a;
        }, []);
    }
    get keys() {
        return Object.keys(this).reduce((a, key) => {
            if(key[ 0 ] !== "_" || (key[ 0 ] === "_" && key[ 1 ] !== "_")) {
                return [ ...a, key ];
            }

            return a;
        }, []);
    }
    
    get ids() {
        return Object.keys(this).reduce((a, v) => {
            if(validate(v)) {
                return [ ...a, v ];
            }

            return a;
        }, []);
    }
    get synonyms() {
        return Object.entries(this).reduce((a, [ k, v ]) => {
            if((k[ 0 ] !== "_" || (k[ 0 ] === "_" && k[ 1 ] !== "_")) && validate(v)) {
                return [ ...a, k ];
            }

            return a;
        }, []);
    }

    register(entry, ...synonyms) {
        let uuid = (entry || {}).__id || uuidv4();
        
        this[ uuid ] = entry;
        this.__props.size += 1;

        for(let synonym of synonyms) {
            this[ synonym ] = uuid;
        }

        return this;
    }
    unregister(entryOrId) {
        let uuid = validate(entryOrId) ? entryOrId : (entryOrId || {}).__id;
        
        if(uuid) {
            const entry = this[ uuid ];
            for(let [ key, value ] of Object.entries(this)) {
                if(value === entry) {   // this[ synonym ] will return the this[ uuid ], because of the Proxy get trap, thus @entry
                    delete this[ key ];
                }
            }

            delete this[ uuid ];
            this.__props.size -= 1;
        }

        return this;
    }
};

export function Factory(deep) {
    return new Registry(deep);
};

Registry.Factory = Factory;

export default Registry;