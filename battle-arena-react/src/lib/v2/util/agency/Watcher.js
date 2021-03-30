import Watchable from "./Watchable";
import Emitter from "./Emitter";

export class Watcher extends Emitter {
    constructor(watchables = [], { handlers = [], events = [],  ...opts } = {}) {
        super(events, { ...opts });

        this.__handlers = new Set(handlers);

        if(watchables instanceof Watchable) {
            watchables.$.subscribe(this);
        } else if(Array.isArray(watchables)) {
            for(let watchable of watchables) {
                watchable.$.subscribe(this);
            }
        }

        const _this = this;
        this.$.subscribe(function(...args) {
            for(let handler of _this.__handlers) {
                handler.call(this, ...args);
            }
        });
    }

    get $() {
        const _this = this;

        return {
            ...super.$,

            watch(...watchables) {
                for(let watchable of watchables) {
                    if(watchable instanceof Watchable) {
                        watchable.$.subscribe(_this);
                    }
                }

                    return _this;
            },
            unwatch(...watchables) {
                for(let watchable of watchables) {
                    if(watchable instanceof Watchable) {
                        watchable.$.unsubscribe(_this);
                    }
                }

                    return _this;
            },

            addHandler(handler) {
                _this.__handlers.add(handler);

                return this;
            },
            removeHandler(handler) {
                return _this.__handlers.delete(handler);
            },

            on(prop, handler) {
                const fn = function(p, ...args) {
                    if(p === prop) {
                        handler.call(this, ...args)
                    }
                };

                _this.__handlers.add(fn);

                return fn;
            },
            like(regex, handler) {
                const fn = function(p, ...args) {
                    if(regex.test(p)) {
                        handler.call(this, p, ...args)
                    }
                };

                _this.__handlers.add(fn);

                return fn;
            },
            when(watchable, handler) {
                const fn = function(...args) {
                    if(this.subject === watchable) {
                        handler.call(this, ...args)
                    }
                };

                _this.__handlers.add(fn);

                return fn;
            },
        }
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