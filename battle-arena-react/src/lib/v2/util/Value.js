export default class Value {
    constructor(current = 0, { min, max, softMax = false, softMin = false } = {}) {
        this._current = current;
        this._min = min;
        this._max = max;
        
        this.__config = {
            softMax,
            softMin,
        };
    }

    get current() {
        if(!Number.isNaN(+this._max) && this._current >= this._max) {
            if(this.__config.softMax) {
                return this._current;
            }

            return this._max;
        } else if(!Number.isNaN(+this._min) && this._current <= this._min) {
            if(this.__config.softMin) {
                return this._current;
            }

            return this._min;
        }

        return this._current;
    }
    set current(value) {
        if(!Number.isNaN(+this._max) && value >= this._max) {
            this._current = this.__config.softMax ? value : this._max;
        } else if(!Number.isNaN(+this._max) && value <= this._min) {
            this._current = this.__config.softMin ? value : this._min;
        } else {
            this._current = value;
        }

        return this;
    }

    get rate() {
        return this.current / this.max;
    }
    get percent() {
        return 100 * this.rate;
    }
    get permill() {
        return 1000 * this.rate;
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
        this.__config.softMax = true;

        return this;
    }
    hardMax() {
        this.__config.softMax = false;

        return this;
    }
    softMin() {
        this.__config.softMin = true;

        return this;
    }
    hardMin() {
        this.__config.softMin = false;

        return this;
    }

    toData() {
        return {
            current: this.current,
            min: this.min,
            max: this.max,
        };
    }
}