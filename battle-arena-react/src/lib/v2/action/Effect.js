export class Effect {    
    constructor(executor) {
        this.executor = executor;
    }

    invoke({ target, source, ...rest } = {}) {
        return this.executor({ target, source, ...rest });
    }
};

export default Effect;