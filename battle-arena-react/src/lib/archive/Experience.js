import Value from "./Value";

export default class Experience extends Value {
    constructor(value, { level = 1, formula, ...opts } = {}) {
        super(value, { softMax: true, ...opts });

        this._formula = formula || this.__default;  // @formula is used to calculate this.max
        this.level = level;

        this.recalculate();

        this.on("max", (...args) => this.onMax(...args));
    }

    __default(level) {
        return level * 100;
    }

    get formula() {
        if(this._formula) {
            return this._formula;
        }

        return this.__default;
    }
    set formula(fn) {
        if(typeof fn === "function") {
            this._formula = fn;
        }

        this._formula = this.__default;
    }

    recalculate() {
        this.max = this.formula.call(this, this.level);
    }

    onMax() {
        if(this.current >= this.max) {
            this.current -= this.max;
        } else {
            this.current = 0;
        }
        
        this.level += 1;
        this.recalculate();
        this.emit("level");

        if(this.current >= this.max) {
            this.emit("max");
        }
    }

    toData() {
        return {
            ...super.toData(),
            level: this.level,
        }
    }
}