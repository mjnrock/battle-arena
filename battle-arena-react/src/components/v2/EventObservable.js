// import Observable from "./Observable";
// import Observer from "./Observer";
import Observable from "@lespantsfancy/agency/lib/Observable";
import Observer from "@lespantsfancy/agency/lib/Observer";

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

/**
 * This class wraps an <EventEmitter> and watches
 *      for @events.  Each invocation will store
 *      all arguments present in the event into a
 *      local this[ eventName ] object, thus triggering
 *      any attached <Observer> to broadcast the data.
 *      
 * The <EventObservable> will cache the previous (n-1)
 *      data so that comparative analysis can be performed.
 * 
 * ? Middleware can be added to any given event listener
 * ?    to use <EventObservable> as a mediation center, too.
 * ?    If the middleware fn --> false, then the handler
 * ?     will not fire.
 * ? @useExistingFnAsMiddleware=true will use any existing function
 * ?    present on an `on${ eventName }` assignment as the middleware.
 * 
 * ! Because of the getter/setters on <Observable>, you
 * !    cannot follow a "next" event; you must specify
 * !    the specific properties, if wrapping a "nextable".
 */
export class EventObservable extends Observable {
    constructor(eventEmitter, events = [], { middleware = {}, useExistingFnAsMiddleware = false } = {}) {
        super(false, { noWrap: true });

        this.__emitter = eventEmitter;
        this.__handlers = {};
        this.__middleware = middleware;

        this.__config = {
            useExistingFnAsMiddleware,
        };

        const _this = new Proxy(this, {
            get(target, prop) {
                return target[ prop ];
            },
            set(target, prop, value) {
                target[ prop ] = value;
                target.next(prop, target[ prop ]);

                return target;
            }
        });

        _this.add(...events);

        return _this;
    }

    __updateFn(type, ...args) {
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

                this.__updateFn(eventName, ...args);

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

//? Use the .Factory method to create a <Observable> with default state
export function Factory(eventEmitter, events, opts = {}) {
    return new EventObservable(eventEmitter, events, opts);
};

export function SubjectFactory(eventEmitter, events, opts = {}) {
    const obs = new Observer(EventObservable.Factory(eventEmitter, events, opts));

    for(let [ key, value ] of Object.entries(opts)) {
        if(events.includes(key) || key === "next") {
            if(typeof opts[ key ] === "function") {
                obs.on(key, opts[ key ]);
            }
        }
    }
    
    if(opts.insertRef) {
        eventEmitter.__agencyEObs = obs;
    }

    return obs;
};


export function GetRef(eventEmitter) {
    return eventEmitter.__agencyEObs;
};

EventObservable.GetRef = GetRef;
EventObservable.Factory = Factory;
EventObservable.SubjectFactory = SubjectFactory;

export default EventObservable;