import { v4 as uuidv4 } from "uuid";
import EventEmitter from "events";
// import Observable from "./Observable";
// import Observer from "./Observer";
// import Proposition from "./Proposition";
import Observable from "@lespantsfancy/agency/lib/Observable";
import Observer from "@lespantsfancy/agency/lib/Observer";
import Proposition from "@lespantsfancy/agency/lib/Proposition";

/**
 * A "multi-subject" <Observer>
 */
export class Beacon extends EventEmitter {
    constructor() {
        super();

        this.members = new Map();
        this.lookup = new Map();
    }

    attach(observer, proposition) {
        if(observer instanceof Observable) {
            observer = new Observer(observer);
        }
        
        let fn;
        if (proposition instanceof Proposition) {
            fn = (props, value, ob, obs) => {
                if (proposition.test(props, value, observer)) {
                    this.emit(props, value, ob || observer.subject, obs || observer);
                    this.emit("next", props, value, ob || observer.subject, obs || observer);
                }
            };
        } else {
            fn = (props, value, ob, obs) => {
                this.emit(props, value, ob || observer.subject, obs || observer);
                this.emit("next", props, value, ob || observer.subject, obs || observer);
            }
        };

        this.members.set(observer.__id, { member: observer, fn });

        observer.on("next", fn);

        return observer;
    }
    detach(observer) {
        const { fn } = this.members.get(observer.__id);
        observer.off("next", fn);

        this.members.delete(observer.__id);
    }

    addAltListener(type = "prop", input, fn) {
        const uuid = uuidv4();
        
        let wfn;
        if(type === "prop") {
            wfn = (p, v, ob, obs) => {
                if(p === input) {
                    fn(p, v, ob, obs);
                }
            };
        } else if(type === "observable") {
            wfn = (p, v, ob, obs) => {
                if(ob === input || ob.__id === input) {
                    fn(p, v, ob, obs);
                }
            };
        } else if(type === "observer") {
            wfn = (p, v, ob, obs) => {
                if(obs === input || obs.__id === input) {
                    fn(p, v, ob, obs);
                }
            };
        }

        this.lookup.set(uuid, wfn);
        this.on("next", wfn);

        return uuid;
    }
    addPropListener(property, fn) {
        return this.addAltListener("prop", property, fn);
    }
    addObservableListener(observable, fn) {
        return this.addAltListener("observable", observable, fn);
    }
    addObserverListener(observer, fn) {
        return this.addAltListener("observer", observer, fn);
    }
}

export function PropType(prop) {
    if(prop instanceof RegExp) {
        return Proposition.OR(
            (props, value, observer) => {
                return prop.test(props);
            }
        );
    }

    return Proposition.OR(
        (props, value, observer) => {
            return props === prop;
        }
    );
}
export function PropTypes(...props) {
    return Proposition.OR(
        (prop, value, observer) => {
            return props.includes(prop);
        }
    );
}

export function IsObserver(observerOrId) {
    return Proposition.OR(
        (prop, value, observer) => {
            if(observerOrId instanceof Observer) {
                return observer === observerOrId;
            }

            return observer.__id === observerOrId;
        }
    );
}

Beacon.PropType = PropType;
Beacon.PropTypes = PropTypes;
Beacon.IsObserver = IsObserver;

export default Beacon;