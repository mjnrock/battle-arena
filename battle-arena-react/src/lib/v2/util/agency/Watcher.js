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