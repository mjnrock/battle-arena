export class Effect {    
    constructor(executor) {
        this.executor = executor;
    }

    invoke({ target, source, ...rest } = {}) {
        return this.executor({ target, source, ...rest });
    }

    static Invoke(effects = [], ...args) {
        let results = [];
        for(let effect of effects) {
            if(effect instanceof Effect) {
                results.push(effect.invoke(...args));
            } else if(typeof effect === "function") {
                results.push(effect(...args));
            }
        }

        if(results.length === 1) {
            return results[ 0 ];
        }

        return results;
    }
};

export default Effect;