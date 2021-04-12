export class State {
    constructor(type, duration, { next, isComplete, meta = {} } = {}) {
        this.type = type;

        this._start = Date.now();
        if(typeof duration === "function") {
            this._duration = duration();
        } else {
            this._duration = duration;

        }

        if(typeof next === "function") {
            this.next = next;
        }
        if(typeof isComplete === "function") {
            this._isComplete = isComplete;
        }

        this.meta = meta;
    }

    get progress() {
        const now = Date.now();
        const elapsed = now - this._start;

        return elapsed / this._duration;
    }
    get isComplete() {
        if(typeof this._isComplete === "function") {
            return this._isComplete(this);
        }

        return this.progress >= 1;
    }
};

export default State;