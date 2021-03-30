import { v4 as uuidv4, validate } from "uuid";

export const WatchableArchetype = class {};

export const wrapNested = (root, prop, input) => {
    if(input === null || prop.includes("__")) {
        return input;
    }

    if(input instanceof WatchableArchetype) {
        return input;
    } else if(root instanceof Watchable && input instanceof Watchable) {
        if(root.$.proxy !== input.$.proxy) {    // Don't broadcast if the input is also the root (e.g. circular references)
            input.$.subscribe(root.$.proxy, prop);
        }

        //FIXME  Watchable{1}.Object.Watchable{2} --> w/ ref to Watchable{1} creates infinite loop (e.g. Entity.Movement.Wayfinder.entity = Entity)

        return input;
    }

    const proxy = new Proxy(input, {
        getPrototypeOf(t) {
            return WatchableArchetype.prototype;
        },
        get(t, p) {
            return Reflect.get(t, p);
        },
        set(t, p, v) {
            let nprop = `${ prop }.${ p }`;

            if(t[ p ] === v) {  // Ignore if the old value === new value
                return t;
            }

            if(v === null || p[ 0 ] === "_" || (Object.getOwnPropertyDescriptor(t, p) || {}).set) {      // Don't broadcast any _Private/__Internal variables
                return Reflect.defineProperty(t, p, {
                    value: v,
                    configurable: true,
                    writable: true,
                    enumerable: false,
                });

                // return Reflect.set(t, p, v);
            }
            
            if(typeof v === "object") {
                let ob = wrapNested(root, nprop, v);

                Reflect.set(t, p, ob);
            } else {
                Reflect.set(t, p, v);
            }
            
            if(!(Array.isArray(input) && p in Array.prototype)) {   // Don't broadcast native <Array> keys (i.e. .push returns .length)
                root.$.broadcast(nprop, v);
            }

            return t;
        },
        deleteProperty(t, p) {
            if(p in t) {
                if(t[ p ] instanceof Watchable) {
                    t[ p ].$.unsubscribe(t.$.proxy);
                }

                return Reflect.deleteProperty(t, p);
            }

            return false;
        },
    });

    for(let [ key, value ] of Object.entries(input)) {
        if(typeof value === "object") {
            let kprop = `${ prop }.${ key }`;
            
            proxy[ key ] = wrapNested(root, kprop, value);
        }
    }

    return proxy;
};

export class Watchable {
    constructor(state = {}, { deep = true, only = [], ignore = [] } = {}) {        
        const proxy = new Proxy(this, {
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

                return Reflect.get(target, prop);
            },
            set(target, prop, value) {
                if(target[ prop ] === value || prop === "$") {  // Ignore if the old value === new value, or if accessing get $()
                    return target;
                }
                
                if(value === null || prop[ 0 ] === "_" || (Object.getOwnPropertyDescriptor(target, prop) || {}).set) {      // Don't broadcast any _Private/__Internal variables
                    // if(prop[ 0 ] === "_" && prop[ 1 ] === "_") {        // Prevent modification of internal variables after first assignment
                    //     return Reflect.defineProperty(target, prop, {
                    //         value,
                    //         configurable: false,
                    //         writable: false,
                    //         enumerable: false,
                    //     });
                    // }

                    return Reflect.defineProperty(target, prop, {
                        value,
                        configurable: true,
                        writable: true,
                        enumerable: false,
                    });
                    // return Reflect.set(target, prop, value);
                }

                if(deep && typeof value === "object") {
                    let newValue = wrapNested(target, prop, value);

                    Reflect.set(target, prop, newValue);
                    target.$.broadcast(prop, newValue);
                } else {
                    Reflect.set(target, prop, value);
                    target.$.broadcast(prop, value);
                }

                return target;
            },
            deleteProperty(target, prop) {
                if(prop in target) {
                    if(target[ prop ] instanceof Watchable) {
                        target[ prop ].$.unsubscribe(target.$.proxy);
                    }

                    return Reflect.deleteProperty(target, prop);
                }

                return false;
            },
        });

        proxy.__id = uuidv4();

        proxy.__subscribers = new Map();

        if(only.length || ignore.length) {
            proxy.__filter = {
                type: only.length ? true : (ignore.length ? false : null),
                props: only.length ? only : (ignore.length ? ignore : []),
            };
        }

        //NOTE  Allow @target to regain its <Proxy>, such as in a .broadcast(...) --> { subject: @target } situation
        proxy.__ = { proxy: proxy, target: this };  // Store a proxy and target accessor so that either can access each other

        if(typeof state === "object") {
            for(let [ key, value ] of Object.entries(state)) {
                proxy[ key ] = value;
            }
        }

        return proxy;
    }

    [ Symbol.iterator ]() {
        var index = -1;
        var data = Object.entries(this);

        return {
            next: () => ({ value: data[ ++index ], done: !(index in data) })
        };
    };

    // Method wrapper to easily prevent { key : value } collisions
    get $() {
        const _this = this;

        return {    
            get ownKeys() {
                return Reflect.ownKeys(_this);
            },
            get size() {
                return Object.keys(_this).length;
            },
            get keys() {
                return Object.keys(_this);
            },
            get values() {
                return Object.values(_this);
            },

            get id() {
                return _this.__id;
            },
            get proxy() {
                return _this.__.proxy;
            },
            get target() {
                return _this.__.target;
            },

            async broadcast(prop, value) {
                if(_this.__filter) {
                    if(_this.__filter.type === true) {
                        if(!_this.__filter.props.includes(prop)) {
                            return _this;
                        }
                    } else if(_this.__filter.type === false) {
                        if(_this.__filter.props.includes(prop)) {
                            return _this;
                        }
                    }
                }

                for(let [ subscriber, parentProp ] of _this.__subscribers.values()) {
                    /**
                     * @prop | The chain-prop from the original emission
                     * @value | The chain-prop's value from the original emission
                     * @subject | The original .broadcast <Watchable>
                     * @observer | The original subscriber (fn|Watcher) -- The original <Watcher> in a chain emission
                     * @emitter | The emitting <Watchable> -- The final <Watcher> in a chain emission
                     * @subscriber | The subscription fn|Watcher receiving the invocation
                     */
                    const payload = {
                        prop: parentProp != null  ? `${ parentProp }.${ prop }` : prop,
                        value,
                        subject: "subject" in this ? this.subject.$.proxy : _this.$.proxy,
                        emitter: _this.$.proxy,
                        subscriber: subscriber instanceof Watchable ? subscriber.$.proxy : subscriber,
                    };
        
                    let finalProp;
                    if("__namespace" in payload.subject) {      // Proxy evaluation to test if an Emitter
                        if(payload.subject.__namespace === Infinity) {      // Special Case: Emit from local scope
                            if(Object.keys(payload.subject.__events).includes(prop.slice(prop.lastIndexOf(".") + 1))) {
                                finalProp = `${ parentProp }.$${ prop }`;   // Prepend "$" to the event to signify that prop does not exist--it is a scoped event (.e.g "nested.cat" --> "nested.$cat")
                            } else {
                                finalProp = payload.prop;
                            }
                        } else if(Object.keys(payload.subject.__events).includes(prop.slice(prop.lastIndexOf(".") + 1))) {   // A state change in the Emitter (check for event only--namespace removed)
                            finalProp = prop;
                        } else {
                            finalProp = payload.prop;
                        }
                    } else {
                        finalProp = payload.prop;
                    }
                    
                    if(typeof subscriber === "function") {
                        subscriber.call(payload, finalProp, value, payload.subject.$.id);
                    } else if(subscriber instanceof Watchable) {
                        subscriber.$.broadcast.call(payload, finalProp, value, payload.subject.$.id);
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
        
            subscribe(input, prop) {
                if(typeof input === "function") {
                    const uuid = uuidv4();
                    _this.__subscribers.set(uuid, [ input, prop ]);
        
                    return uuid;
                } else if(input instanceof Watchable) {
                    _this.__subscribers.set(input.$.id, [ input, prop ]);
        
                    return input.$.id;
                }
        
                return false;
            },
            unsubscribe(entryOrId) {
                if(validate(entryOrId)) {
                    return _this.__subscribers.delete(entryOrId);
                } else if(validate((entryOrId || {}).__id)) {
                    return _this.__subscribers.delete((entryOrId || {}).__id);
                }

                return false;
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
                        if(!(key[ 0 ] === "_" && key[ 1 ] === "_")) {
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
                    if(key[ 0 ] !== "_") {
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






// import { v4 as uuidv4 } from "uuid";

// export const WatchableArchetype = class {};

// export const wrapNested = (root, prop, input, nestedProps) => {
//     if(input === null || prop.includes("__")) {
//         return input;
//     }

//     if(input instanceof WatchableArchetype) {
//         return input;
//     } else if(root instanceof Watchable && input instanceof Watchable) {
//         if(root.$.proxy !== input.$.proxy) {    // Don't broadcast if the input is also the root (e.g. circular references)
//             input.$.subscribe(root.$.proxy, prop);
//         }

//         //FIXME  Watchable{1}.Object.Watchable{2} --> w/ ref to Watchable{1} creates infinite loop (e.g. Entity.Movement.Wayfinder.entity = Entity)

//         return input;
//     }

//     const proxy = new Proxy(input, {
//         getPrototypeOf(t) {
//             return WatchableArchetype.prototype;
//         },
//         get(t, p) {
//             return t[ p ];
//         },
//         set(t, p, v) {
//             if(t[ p ] === v) {  // Ignore if the old value === new value
//                 return t;
//             }

//             if(v === null || p[ 0 ] === "_" || (Object.getOwnPropertyDescriptor(t, p) || {}).set) {      // Don't broadcast any _Private/__Internal variables
//                 t[ p ] = v;

//                 return t;
//             }
            
//             if(typeof v === "object") {
//                 let ob = wrapNested(root, nestedProps ? `${ prop }.${ p }` : p, v, nestedProps);

//                 t[ p ] = ob;
//             } else {
//                 t[ p ] = v;
//             }
            
//             if(!(Array.isArray(input) && p in Array.prototype)) {   // Don't broadcast native <Array> keys (i.e. .push returns .length)
//                 root.$.broadcast(nestedProps ? `${ prop }.${ p }` : p, v);
//             }

//             return t;
//         },
//         // deleteProperty(t, p) {
//         //     if(p in t) {
//         //         delete t[ p ];

//         //         t.$.broadcast(p, void 0);
//         //     }
//         // }
//     });

//     for(let [ key, value ] of Object.entries(input)) {
//         if(typeof value === "object") {
//             // proxy[ key ] = wrapNested(root, prop, value, nestedProps);
//             proxy[ key ] = value;//wrapNested(root, prop, value, nestedProps);
//         }
//     }

//     return proxy;
// };

// export class Watchable {
//     constructor(state = {}, { deep = true, only = [], ignore = [], nestedProps = true } = {}) {
//         this.__id = uuidv4();

//         this.__subscribers = new Map();

//         if(only.length || ignore.length) {
//             this.__filter = {
//                 type: only.length ? true : (ignore.length ? false : null),
//                 props: only.length ? only : (ignore.length ? ignore : []),
//             };
//         }
        
//         const proxy = new Proxy(this, {
//             get(target, prop) {
//                 if((typeof prop === "string" || prop instanceof String) && prop.includes(".")) {
//                     let props = prop.split(".");

//                     if(props[ 0 ] === "$") {
//                         props = props.slice(1);
//                     }

//                     let result = target;
//                     for(let p of props) {
//                         if(result[ p ] !== void 0) {
//                             result = result[ p ];
//                         }
//                     }

//                     if(result !== target) {
//                         return result;
//                     } else {
//                         return;
//                     }
//                 }

//                 return target[ prop ];
//             },
//             set(target, prop, value) {
//                 if(target[ prop ] === value || prop === "$") {  // Ignore if the old value === new value, or if accessing get $()
//                     return target;
//                 }
                
//                 if(value === null || prop[ 0 ] === "_" || (Object.getOwnPropertyDescriptor(target, prop) || {}).set) {      // Don't broadcast any _Private/__Internal variables
//                     target[ prop ] = value;

//                     return target;
//                 }

//                 if(deep && typeof value === "object") {
//                     target[ prop ] = wrapNested(target, prop, value, nestedProps);

//                     target.$.broadcast(prop, target[ prop ]);
//                 } else {
//                     target[ prop ] = value;

//                     target.$.broadcast(prop, value);
//                 }

//                 return target;
//             },
//             // deleteProperty(target, prop) {
//             //     if(prop in target) {
//             //         delete target[ prop ];

//             //         target.$.broadcast(prop, void 0);
//             //     }
//             // }
//         });

//         //NOTE  Allow @target to regain its <Proxy>, such as in a .broadcast(...) --> { subject: @target } situation
//         this.__ = { proxy: proxy, target: this };  // Store a proxy and target accessor so that either can access each other

//         if(typeof state === "object") {
//             for(let [ key, value ] of Object.entries(state)) {
//                 proxy[ key ] = value;
//             }
//         }

//         return proxy;
//     }

//     // Method wrapper to easily prevent { key : value } collisions
//     get $() {
//         const _this = this;

//         return {
//             get id() {
//                 return _this.__id;
//             },
//             get proxy() {
//                 return _this.__.proxy;
//             },
//             get target() {
//                 return _this.__.target;
//             },

//             async broadcast(prop, value) {
//                 if(_this.__filter) {
//                     if(_this.__filter.type === true) {
//                         if(!_this.__filter.props.includes(prop)) {
//                             return _this;
//                         }
//                     } else if(_this.__filter.type === false) {
//                         if(_this.__filter.props.includes(prop)) {
//                             return _this;
//                         }
//                     }
//                 }

//                 for(let [ subscriber, nestedProp ] of _this.__subscribers.values()) {
//                     /**
//                      * @prop | The chain-prop from the original emission
//                      * @value | The chain-prop's value from the original emission
//                      * @subject | The original .broadcast <Watchable>
//                      * @observer | The original subscriber (fn|Watcher) -- The original <Watcher> in a chain emission
//                      * @emitter | The emitting <Watchable> -- The final <Watcher> in a chain emission
//                      * @subscriber | The subscription fn|Watcher receiving the invocation
//                      */
//                     const payload = {
//                         prop: nestedProp != null  ? `${ nestedProp }.${ prop }` : prop,
//                         // prop,
//                         value,
//                         subject: "subject" in this ? this.subject.$.proxy : _this.$.proxy,
//                         emitter: _this.$.proxy,
//                         subscriber: subscriber instanceof Watchable ? subscriber.$.proxy : subscriber,
//                     };
        
//                     if(typeof subscriber === "function") {
//                         subscriber.call(payload, prop, value, payload.subject.$.id);
//                     } else if(subscriber instanceof Watchable) {
//                         subscriber.$.broadcast.call(payload, payload.prop, value, payload.subject.$.id);
//                     }
//                 }
        
//                 return _this;
//             },

//             purge(deep = false) {
//                 _this.__subscribers.clear();
        
//                 if(deep) {
//                     for(let [ key, value ] of Object.entries(_this)) {
//                         if(value instanceof Watchable) {
//                             value.$.purge(true);
//                         }
//                     }
//                 }
        
//                 return _this;
//             },
        
//             subscribe(input, prop) {
//                 if(typeof input === "function") {
//                     const uuid = uuidv4();
//                     _this.__subscribers.set(uuid, [ input, prop ]);
        
//                     return uuid;
//                 } else if(input instanceof Watchable) {
//                     _this.__subscribers.set(input.$.id, [ input, prop ]);
        
//                     return input.$.id;
//                 }
        
//                 return false;
//             },
//             unsubscribe(id) {
//                 return _this.__subscribers.delete(id);
//             },
        
//             toData({ includePrivateKeys = false } = {}) {
//                 const obj = {};
            
//                 if("__arrayLength" in _this) {
//                     const arr = [];
//                     for(let i = 0; i < _this.__arrayLength; i++) {
//                         const entry = _this[ i ];
        
//                         if(entry instanceof Watchable) {
//                             arr.push(entry.$.toData());
//                         } else {
//                             arr.push(entry);
//                         }
//                     }
        
//                     return arr;
//                 }
        
//                 if(includePrivateKeys) {
//                     for(let [ key, value ] of Object.entries(_this)) {
//                         if(!(key[ 0 ] === "_" && key[ 1 ] === "_")) {
//                             if(value instanceof Watchable) {
//                                 obj[ key ] = value.$.toData();
//                             } else {
//                                 obj[ key ] = value;
//                             }
//                         }
//                     }
            
//                     return obj;
//                 }
        
//                 for(let [ key, value ] of Object.entries(_this)) {
//                     if(key[ 0 ] !== "_") {
//                         if(value instanceof Watchable) {
//                             obj[ key ] = value.$.toData();
//                         } else {
//                             obj[ key ] = value;
//                         }
//                     }
//                 }
            
//                 return obj;
//             },
//         }
//     }
// };

// export function Factory(state, opts = {}) {
//     return new Watchable(state, opts);
// };

// Watchable.Factory = Factory;

// export default Watchable;