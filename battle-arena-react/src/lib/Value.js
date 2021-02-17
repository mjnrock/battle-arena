import EventEmitter from "events";
import { type } from "os";

export default class Value extends EventEmitter {
    constructor(current, { min, max, softMax = false, softMin = false } = {}) {
        super();

        this._current = current;
        this._min = min;
        this._max = max;
        
        this._config = {
            softMax,
            softMin,
        };
    }

    get current() {
        if(this._current >= this._max) {
            if(this._config.softMax) {
                return this._current;
            }

            return this._max;
        } else if(this._current <= this._min) {
            if(this._config.softMin) {
                return this._current;
            }

            return this._min;
        }

        return this._current;
    }
    set current(value) {
        if(value >= this._max) {
            this._current = this._config.softMax ? value : this._max;

            this.emit("max");
        } else if(value <= this._min) {
            this._current = this._config.softMin ? value : this._min;

            this.emit("min");
        }

        this._current = value;

        this.emit("current", this._current);
    }

    get min() {
        return this._min;
    }
    set min(value) {
        this._min = value;
    }

    get max() {
        return this._max;
    }
    set max(value) {
        this._max = value;
    }

    get isMax() {
        return this._current >= this._max;
    }
    get isMin() {
        return this._current <= this._min;
    }
    get isZero() {
        return this._current === 0;
    }
    

    add(value) {
        this.current += value;

        return this;
    }
    subtract(value) {
        this.current -= value;

        return this;
    }
    multiply(value) {
        this.current *= value;

        return this;
    }
    divide(value) {
        this.current /= value;

        return this;
    }
    power(value) {
        this.current = this.current ** value;

        return this;
    }

    repeat(fnName, iters = 1, ...args) {
        const fn = this[ fnName ];

        if(typeof fn === "function") {        
            for(let i = 0; i < iters; i++) {
                fn(...args);
            }
        }

        return this;
    }

    
    softMax() {
        this._config.softMax = true;

        return this;
    }
    hardMax() {
        this._config.softMax = false;

        return this;
    }
    softMin() {
        this._config.softMin = true;

        return this;
    }
    hardMin() {
        this._config.softMin = false;

        return this;
    }
}