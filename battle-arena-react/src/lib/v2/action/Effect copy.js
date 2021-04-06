export class Effect {
    static EnumMethodType = {
        ADD: "+",
        SUBTRACT: "-",
        MULTIPY: "*",
        DIVIDE: "/",
        POWER: "^",
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
            obj.value = obj.value(target, source);
        }

        this.executor(obj, target, source);
    }

    static Generate(...args) {
        if(args[ 0 ] instanceof Effect) {
            const effect = args[ 0 ];

            return new Effect(effect.executor, effect.magnitude.value, effect.magnitude.method, { isAbsolute: effect.magnitude.isAbsolute });
        }

        return new Effect(...args);
    }
};

export default Effect;