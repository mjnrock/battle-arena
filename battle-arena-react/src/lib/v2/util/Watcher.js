import Watchable from "./Watchable";

export class Watcher extends Watchable {
    constructor(watchables = [], state = {}, opts = {}) {
        super(state, opts);

        if(watchables instanceof Watchable) {
            watchables.$.subscribe(this);
        } else if(Array.isArray(watchables)) {
            for(let watchable of watchables) {
                watchable.$.subscribe(this);
            }
        }
    }

    get $() {
        const _this = this;

        return {
            ...super.$,

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
                        observer: this.observer || this.subscriber || subscriber,
                        emitter: _this,
                        subscriber,
                    };
                    console.log(prop, value)
        
                    if(typeof subscriber === "function") {
                        subscriber.call(payload, prop, value, payload.subject.$.id);
                    } else if(subscriber instanceof Watchable) {
                        subscriber.$.emit.call(payload, prop, value, payload.subject.$.id);
                    }
                }
        
                return _this;
            },
        };
    }
};

export function Factory(watchables, state, opts = {}) {
    return new Watcher(watchables, state, opts);
};
export function SubjectFactory(state, opts = {}) {
    return new Watcher(Watchable.Factory(state, opts));
};

Watcher.Factory = Factory;
Watcher.SubjectFactory = SubjectFactory;

export default Watcher;