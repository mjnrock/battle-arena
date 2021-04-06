export class Effect {
    static EnumMethodType = {
        ADD: "+",
        SUBTRACT: "-",
        ADD_PERCENT: "+%",
        SUBTRACT_PERCENT: "-%",
        EQUAL: "=",
        EQUAL_PERCENT: "=%",
    };
    
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