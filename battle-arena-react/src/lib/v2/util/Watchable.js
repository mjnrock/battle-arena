import { v4 as uuidv4 } from "uuid";

export const WatchableArchetype = class {};

export const wrapNested = (root, prop, input) => {
    if(prop.includes("__")) {
        return input;
    }

    if(input instanceof WatchableArchetype) {
        return input;
    } else if(input instanceof Watchable) {
        input.$.subscribe(function(p, v) {
            root.$.emit.call(this, `${ prop }.${ p }`, v);
        });

        return input;
    }

    const proxy = new Proxy(input, {
        getPrototypeOf(t) {
            return WatchableArchetype.prototype;
        },
        get(t, p) {
            return t[ p ];
        },
        set(t, p, v) {
            if(p.startsWith("_")) {      // Don't emit any _Private/__Internal variables
                t[ p ] = v;

                return t;
            }
            
            if(typeof v === "object") {
                let ob = wrapNested(root, `${ prop }.${ p }`, v);

                t[ p ] = ob;
            } else {
                t[ p ] = v;
            }
            
            if(!(Array.isArray(input) && p in Array.prototype)) {   // Don't emit native <Array> keys (i.e. .push returns .length)
                root.$.emit(`${ prop }.${ p }`, v);
            }

            return t;
        },
    });

    for(let [ key, value ] of Object.entries(input)) {
        if(typeof value === "object") {
            proxy[ key ] = wrapNested(root, `${ prop }.${ key }`, value);
        }
    }

    return proxy;
};

export class Watchable {
    constructor(state = {}, { deep = true } = {}) {
        this.__id = uuidv4();

        this.__subscribers = new Map();
        
        const _this = new Proxy(this, {
            get(target, prop) {
                if((typeof prop === "string" || prop instanceof String) && prop.includes(".")) {
                    let props = prop.split(".");

                    if(props[ 0 ] === "$") {
                        props = props.slice(1);
                    }

                    let result = target;
                    for(let p of props) {
                        if(result[ p ] !== void 0) {
                            result = result[ p ];
                        }
                    }

                    if(result !== target) {
                        return result;
                    } else {
                        return;
                    }
                }

                return target[ prop ];
            },
            set(target, prop, value) {
                if(target[ prop ] === value || prop === "$") {
                    return target;
                }
                
                if(prop.startsWith("_") || (Object.getOwnPropertyDescriptor(target, prop) || {}).set) {      // Don't emit any _Private/__Internal variables
                    target[ prop ] = value;

                    return target;
                }

                if(deep && typeof value === "object") {
                    target[ prop ] = wrapNested(target, prop, value);

                    target.$.emit(prop, target[ prop ]);
                } else {
                    target[ prop ] = value;

                    target.$.emit(prop, value);
                }

                return target;
            }
        });

        if(typeof state === "object") {
            for(let [ key, value ] of Object.entries(state)) {
                _this[ key ] = value;
            }
        }

        //NOTE  Allow @target to regain its <Proxy>, such as in a .emit(...) --> { subject: @target } situation
        this.__ = { proxy: _this, target: this };  // Store a proxy and target accessor so that either can access each other

        return _this;
    }

    // Method wrapper to easily prevent { key : value } collisions
    get $() {
        const _this = this;

        return {
            get id() {
                return _this.__id;
            },
            get proxy() {
                return _this.__.proxy;
            },
            get target() {
                return _this.__.target;
            },

            async emit(prop, value) {
                for(let subscriber of _this.__subscribers.values()) {
                    /**
                     * @prop | The chain-prop from the original emission
                     * @value | The chain-prop's value from the original emission
                     * @subject | The original .emit <Watchable>
                     * @observer | The original subscriber (fn|Watcher) -- The original <Watcher> in a chain emission
                     * @emitter | The emitting <Watchable> -- The final <Watcher> in a chain emission
                     * @subscriber | The subscription fn|Watcher receiving the invocation
                     */
                    const payload = {
                        prop,
                        value,
                        subject: this.subject || _this,
                        emitter: _this,
                        subscriber,
                    };
        
                    if(typeof subscriber === "function") {
                        subscriber.call(payload, prop, value, payload.subject.$.id);
                    } else if(subscriber instanceof Watchable) {
                        subscriber.$.emit.call(payload, prop, value, payload.subject.$.id);
                    }
                }
        
                return _this;
            },

            purge(deep = false) {
                _this.__subscribers.clear();
        
                if(deep) {
                    for(let [ key, value ] of Object.entries(_this)) {
                        if(value instanceof Watchable) {
                            value.$.purge(true);
                        }
                    }
                }
        
                return _this;
            },
        
            subscribe(input) {
                if(typeof input === "function") {
                    const uuid = uuidv4();
                    _this.__subscribers.set(uuid, input);
        
                    return uuid;
                } else if(input instanceof Watchable) {
                    _this.__subscribers.set(input.$.id, input);
        
                    return input.$.id;
                }
        
                return false;
            },
            unsubscribe(nextableOrFn) {
                return _this.__subscribers.delete(nextableOrFn);
            },
        
            toData({ includePrivateKeys = false } = {}) {
                const obj = {};
            
                if("__arrayLength" in _this) {
                    const arr = [];
                    for(let i = 0; i < _this.__arrayLength; i++) {
                        const entry = _this[ i ];
        
                        if(entry instanceof Watchable) {
                            arr.push(entry.$.toData());
                        } else {
                            arr.push(entry);
                        }
                    }
        
                    return arr;
                }
        
                if(includePrivateKeys) {
                    for(let [ key, value ] of Object.entries(_this)) {
                        if(!key.startsWith("__")) {
                            if(value instanceof Watchable) {
                                obj[ key ] = value.$.toData();
                            } else {
                                obj[ key ] = value;
                            }
                        }
                    }
            
                    return obj;
                }
        
                for(let [ key, value ] of Object.entries(_this)) {
                    if(!key.startsWith("_")) {
                        if(value instanceof Watchable) {
                            obj[ key ] = value.$.toData();
                        } else {
                            obj[ key ] = value;
                        }
                    }
                }
            
                return obj;
            },
        }
    }
};

export function Factory(state, opts = {}) {
    return new Watchable(state, opts);
};

Watchable.Factory = Factory;

export default Watchable;