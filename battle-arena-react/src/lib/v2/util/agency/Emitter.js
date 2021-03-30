import Watchable from "./Watchable";

/**
 * [Namespace]:     A customizable wrapper for a given @event.
 *      Because events will natively emit themselves without
 *      any nesting, a @namespace allows similarly-named events
 *      to be wrapped within a context.  For example, if
 *      @namespace = "cat" and @event = "jump", then the emitted
 *      event will be "cat.jump".  If the @namespace is not a
 *      <String>, then it will ignore it (see below for exception).
 * 
 *      Emitter.GetEvent would return "cat.jump" in this normal case.
 * 
 *      ![Special Case]:    @namespace = Infinity
 *          This will make the @event get wrapped by its nested
 *          context.  For example, @event = "jump" and the <Emitter>
 *          is { nested1: { nested2: <Emitter> }}, then the emitted
 *          @event will be "nested1.nested2.jump".
 * 
 *          Because the context is runtime-specific, Emitter.GetEvent
 *          will return @event, without any further wrapping in this
 *          special case.  In the same example, Emitter.GetEvent would
 *          return "jump".
 */
export class Emitter extends Watchable {
    /**
     * See the limitations of this method in <Emitter> documentation
     */
    static GetEvent(namespace, event) {     // A convenience method to help work with namespaces
        if(typeof namespace === "string" && namespace.length) {
            let cleanNamespace = namespace.replace(/^[.\s]+|[.\s]+$/g, "");

            return `${ cleanNamespace }.${ event }`;
        }

        return event;
    };

    static Handler = (...args) => args;     // A convenience method to simply return all passed arguments

    constructor(events = {}, { state = {}, namespace = "", ...rest } = {}) {
        super(state, { ...rest });

        if(Array.isArray(events)) {
            this.__events = {};

            for(let event of events) {
                this.$.handle(event);
            }
        } else {
            this.__events = events;
        }

        this.__namespace = namespace;
        return new Proxy(this, {
            get(target, prop) {
                if(prop[ 0 ] === "$" && prop.length > 1) {
                    let key = prop.slice(1);

                    if(key in target.__events) {
                        let nkey = Emitter.GetEvent(target.__namespace, key);

                        return async (...args) => target.$.broadcast(nkey, target.__events[ key ](...args));
                    }

                    return () => void 0;
                }

                return Reflect.get(target, prop);
            }
        });
    }

    get $() {
        const _this = this;

        return {
            ...super.$,

            get namespace() {
                return _this.__namespace;
            },
            get events() {
                return Object.fromEntries(Object.keys(_this.__events).map(e => {
                    return [ e, Emitter.GetEvent(_this.__namespace, e) ];
                }));
            },
            event(e) {
                return Emitter.GetEvent(_this.__namespace, e);
            },

            addEvent(event, argsFn) {
                if(typeof argsFn === "function") {
                    _this.__events[ event ] = argsFn;
                }
            },
            removeEvent(event) {
                return Reflect.deleteProperty(_this.__events, event);
            },

            handle(event) {
                _this.__events[ event ] = Emitter.Handler;
            },

            async emit(event, ...args) {
                const fn = _this.__events[ event ];

                if(typeof fn === "function") {
                    let nkey = Emitter.GetEvent(_this.__namespace, event);

                    _this.$.broadcast(nkey, fn(...args));
                }

                return this;
            },
        };
    }
};

export default Emitter;