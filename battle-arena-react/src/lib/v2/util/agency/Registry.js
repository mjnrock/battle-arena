import { v4 as uuidv4, validate } from "uuid";

import Watchable from "./Watchable";

export class Registry extends Watchable {
    constructor(entries = [], state = {}, { deep = true, nestedProps } = {}) {
        super(state, { deep, nestedProps });

        for (let entry of entries) {
            if (Array.isArray(entry)) {
                this.register(...entry);
            } else {
                this.register(entry);
            }
        }

        const proxy = new Proxy(this, {
            get(target, prop) {
                if(!validate(prop) && validate(target[ prop ])) {   // prop is NOT a uuid AND target[ prop ] IS a uuid --> prop is a synonym
                    const entry = target[ target[ prop ] ];

                    if(entry !== void 0) {
                        return entry;
                    }
                }

                return Reflect.get(target, prop);
            },
            set(target, prop, value) {
                if (validate(prop)) {        // assignment
                    // target[ prop ] = value;
                    return Reflect.set(target, prop, value);
                } else if (validate(value)) {    // sic | synonym assignment
                    return Reflect.defineProperty(target, prop, {
                        configurable: true,
                        get: function () {
                            return Reflect.get(target, value);  // sic
                        },
                        set: function (v) {
                            return Reflect.set(target, prop, value);
                        },
                    });
                    // return Reflect.set(target, prop, value);
                }

                return target;
            },
        });

        return proxy;
    }

    /**
     * ! [Special Case]:    <Registry> iteration is VALUES ONLY, because the UUID is internal.
     */
    [ Symbol.iterator ]() {
        var index = -1;
        var data = Object.values(this);

        return {
            next: () => ({ value: data[ ++index ], done: !(index in data) })
        };
    };

    get $() {
        const _this = this;
        const _broadcast = super.$.broadcast;
        const _ownKeys = super.$.ownKeys;

        return {
            ...super.$,

            async broadcast(prop, value) {
                if (validate(prop.substring(0, 36))) {
                    prop = prop.slice(37);
                }

                _broadcast.call("emitter" in this ? this : _this.$.proxy, prop, value);

                return _this;
            },
        
            get synonyms() {
                return _ownKeys.reduce((a, k) => {
                    if ((k[ 0 ] !== "_" || (k[ 0 ] === "_" && k[ 1 ] !== "_")) && validate(_this[ k ])) {
                        return [ ...a, k ];
                    }
        
                    return a;
                }, []);
            },
            get records() {
                const obj = {};
                for (let key of _ownKeys) {
                    if (key[ 0 ] !== "_" || (key[ 0 ] === "_" && key[ 1 ] !== "_")) {
                        const entry = _this[ key ];
        
                        if (validate(entry)) {
                            obj[ entry ] = [
                                ...((obj || [])[ entry ] || []),
                                key,
                            ];
                        } else if (validate(key)) {
                            obj[ key ] = [
                                ...((obj || [])[ key ] || []),
                                entry,
                            ];
                        }
                    }
                }
        
                return obj;
            },
        
            register(entry, ...synonyms) {
                //  Prevent anything with an establish "id" from registering multiple times, as it's already an Object and addressed
                if (_this[ (entry || {}).__id ] !== void 0) {
                    return false;
                }
        
                let uuid = (entry || {}).__id || uuidv4();
        
                _this[ uuid ] = entry;
        
                for (let synonym of synonyms) {
                    _this[ synonym ] = uuid;
                }
        
                return uuid;
            },
            unregister(lookup) {        
                let result = _this[ lookup ];
                let keys = [];
        
                for(let key of _ownKeys) {
                    const entry = _this[ key ];
        
                    if(entry === result || entry === lookup) {
                        keys.push(key);
                    }
                }
        
                for(let key of keys) {
                    Reflect.deleteProperty(_this, key)
                }
        
                return keys;
            },
        };
    }
};

export default Registry;