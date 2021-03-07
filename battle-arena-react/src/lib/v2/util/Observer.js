import util from "util";
import { v4 as uuidv4 } from "uuid";
import EventEmitter from "events";
// import Observable from "./Observable";
// import Beacon from "./Beacon";
import Observable from "@lespantsfancy/agency/lib/Observable";
import Beacon from "@lespantsfancy/agency/lib/Beacon";

/**
 * <Observer> will bubble up the original <Observable> and
 *      the first <Observer> to observe the change, no matter
 *      how many nested-levels deep the observation took place.
 */
export class Observer extends EventEmitter {
    constructor(observable) {
        super();

        this.__id = uuidv4();
        this.subject = observable;
    }

    get subject() {
        if(this.__subject instanceof Observer) {
            return this.__subject.subject;
        }

        return this.__subject;
    }
    set subject(observable) {
        if(observable instanceof Observable || util.types.isProxy(observable)) {
            this.__subject = observable;
            this.__subject.next = (props, value, ob) => {
                this.emit(props, value, ob || observable, this);
                this.emit("next", props, value, ob || observable, this);
            };
        } else if(observable instanceof Observer || observable instanceof Beacon) {
            this.__subject = observable;
            this.__subject.on("next", (props, value, subject, observer) => {
                this.emit("next", props, value, subject, observer);
            });
        }

        return this;
    }
};

//  Create an <Observer> from an EXISTING <Observable>
export function Factory(observable) {
    return new Observer(observable);
};

//  Create an <Observer> from an NON-EXISTING <Observable> via Observable.Factory(...args)
export function Generate(state = {}, isDeep = true) {
    return new Observer(Observable.Factory(state, isDeep));
};

Observer.Factory = Factory;
Observer.Generate = Generate;

export default Observer;