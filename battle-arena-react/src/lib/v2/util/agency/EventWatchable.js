import Watchable from "./Watchable";

export const StandardLibrary = {
    Keyboard: [
        "keyup",
        "keydown",
        "keypress",
    ],
    Mouse: [
        "mouseup",
        "mousedown",
        "mousemove",
        "click",
        "dblclick",
        "contextmenu",
    ],
    // Pointer: [
    //     "pointerover",
    //     "pointerenter",
    //     "pointerdown",
    //     "pointermove",
    //     "pointerup",
    //     "pointercancel",
    //     "pointerout",
    //     "pointerleave",
    //     "gotpointercapture",
    //     "lostpointercapture",
    // ],
};

export class EventWatchable extends Watchable {
    constructor(eventEmitter, events = [], { state = {}, deep = false, middleware = {}, useExistingFnAsMiddleware = false } = {}) {
        super(state, { deep });

        this.__emitter = eventEmitter;
        this.__handlers = {};
        this.__middleware = middleware;

        this.__config = {
            useExistingFnAsMiddleware,
        };

        this.add(...events);

        return this;
    }

    async __record(type, ...args) {        
        this[ type ] = {
            previous: {
                data: this[ type ].data,
                dt: this[ type ].dt,
                n: this[ type ].n,
            },
            data: args,
            dt: Date.now(),
            n: (this[ type ].n || 0) + 1,
        };
    }

    add(...eventNames) {
        if(Array.isArray(eventNames[ 0 ])) {    // "Single argument" assumption, overload
            eventNames = eventNames[ 0 ];
        }

        for(let eventName of eventNames) {
            this[ eventName ] = {};
            this.__handlers[ eventName ] = (...args) => {
                if(typeof this.__middleware[ eventName ] === "function") {
                    const result = this.__middleware[ eventName ](...args);

                    if(result === false) {
                        return false;
                    }
                }

                this.__record(eventName, ...args);

                return true;
            }

            if(typeof this.__emitter.on === "function") {
                this.__emitter.on(eventName, this.__handlers[ eventName ]);
            } else if(`on${ eventName }` in this.__emitter) {
                if(this.__config.useExistingFnAsMiddleware && typeof this.__emitter[ `on${ eventName }` ] === "function") {
                    this.__middleware[ eventName ] = this.__emitter[ `on${ eventName }` ];
                }

                this.__emitter[ `on${ eventName }` ] = this.__handlers[ eventName ];
            }
        }

        return this;
    }
    remove(...eventNames) {
        if(Array.isArray(eventNames[ 0 ])) {    // "Single argument" assumption, overload
            eventNames = eventNames[ 0 ];
        }

        for(let eventName of eventNames) {
            this.__emitter.off(eventName, this.__handlers[ eventName ]);
            
            delete this[ eventName ];
            delete this.__middleware[ eventName ];
            delete this.__handlers[ eventName ];
        }

        return this;
    }
}

export function Factory(eventEmitter, events, opts = {}) {
    return new EventWatchable(eventEmitter, events, opts);
};

EventWatchable.Factory = Factory;

export default EventWatchable;