export class Effect {
    /**
     * @method should be one of: "+", "-", "+%", "-%", "=", "=%"
     */
    constructor(executor, value, method, { isAbsolute = false } = {}) {
        this.magnitude = {
            value,
            method,
            isAbsolute,
        };
        this.executor = executor;
    }

    apply(target, source) {
        const obj = { ...this.magnitude };
        if(typeof obj.value === "function") {
            obj.value = obj.value(source, target);
        }

        this.executor(obj, target, source);
    }
};

export default Effect;