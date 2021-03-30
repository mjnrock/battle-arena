import Emitter from "./Emitter";
import Watcher from "./Watcher";
import Registry from "./Registry";

export class Network extends Watcher {
    /**
     * @parentKey will be inserted via Reflect.defineProperty into the emitter on .join--as an internal property (i.e. `__${ parentKey }`)--and removed on .leave
     */
    constructor(emitters = [], { parentKey = "network", ...opts } = {}) {
        super([], { ...opts });

        this.__parentKey = parentKey;

        this.emitters = new Registry();
        this.$.join(...emitters);
    }

    get $() {
        const _this = this;
        const _broadcast = super.$.broadcast;

        const obj = {
            ...super.$,

            /**
             * Prepend the namespace, if it exists, and eliminate redundant wrapping in nested <Network(s)>.
             */
            async broadcast(prop, value) {
                if((typeof _this.__namespace === "string" && _this.__namespace.length) || _this.__namespace === Infinity) {
                    const regex = new RegExp(`(${ _this.__namespace }.)+`, "i");
                    const newProp = `${ _this.__namespace }.${ prop }`.replace(regex, `${ _this.__namespace }.`);

                    return _broadcast.call(this, newProp, value);
                }

                return _broadcast.call(this, prop, value);
            },

            join(emitter, ...synonyms) {
                if(emitter instanceof Emitter) {
                    _this.emitters.register(emitter, ...synonyms);
        
                    _this.$.watch(emitter);
        
                    Reflect.defineProperty(emitter, _this.__parentKey, {
                        configurable: true,
                        get: function() {
                            return Reflect.get(_this, `__${ _this.__parentKey }`);
                        },
                        set: function(value) {
                            return Reflect.set(_this, `__${ _this.__parentKey }`, value);
                        },
                    });
                    emitter[ _this.__parentKey ] = _this;
                }
        
                return _this;
            },
        
            leave(...emitters) {
                let bools = [];
                for(let emitter of emitters) {
                    if(emitter instanceof Emitter) {
                        let bool = _this.emitters.unregister(emitter).length;
            
                        if(bool) {    
                            _this.$.unwatch(emitter);
        
                            Reflect.deleteProperty(emitter, `__${ _this.__parentKey }`);     // Delete the value
                            Reflect.deleteProperty(emitter, _this.__parentKey);       // Delete the trap--will get recreated if emitter rejoins a <${ _this.__parentKey }>
                        }
            
                        bools.push(bool);
                    }
                }
        
                if(bools.length === 1) {
                    return bools[ 0 ];
                }
        
                return bools;
            },
        
            /**
             * Due to the nature of <Emitter>, if an emitter does not contain
             *      the @event, then it will not emit it.  This behavior can
             *      be exploited to create de facto groups based on the presence
             *      or absence of an event within a given emitter, and invoke
             *      those groups collectively here.
             */
            fire(event, ...args) {
                for(let emitter of _this.emitters) {
                    emitter.$.emit(event, ...args);
                }
        
                return _this;
            },
        
            /**
             * @param {string} event | The event name
             * @param {fn} argsFn | .$event(...args) finalizes as .broadcast(event, argsFn(...args))
             * @param {fn} filter | A selector function that filters which of this.emitters will have the new event added
             */
            attachEvent(event, { argsFn, filter } = {}) {
                const emitters = typeof filter === "function" ? filter(_this.emitters) : _this.emitters;
        
                for(let emitter of emitters) {
                    if(typeof argsFn === "function") {
                        emitter.$.addEvent(event, argsFn);
                    } else {
                        emitter.$.handle(event);
                    }
                }
        
                return _this;
            },
            detatchEvent(...events) {
                for(let emitter of _this.emitters) {
                    for(let event of events) {
                        emitter.$.removeEvent(event);
                    }
                }
        
                return _this;
            },
        };

        obj.bulkJoin = function(joinArgs = []) {
            for(let [ emitter, ...synonyms ] of joinArgs) {
                obj.join(emitter, ...synonyms);
            }
    
            return _this;
        };
        /**
         * @param {[ event, { argsFn, filter }]} addEventArgs | This should have one array row per intended .addEvent call
         */
        obj.bulkAttachEvent = function(addEventArgs = []) {
            for(let [ event, opts ] of addEventArgs) {
                obj.attachEvent(event, opts);
            }
    
            return _this;
        };

        return obj;
    }
};

export default Network;