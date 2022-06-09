export class Action {
    /**
     * @activator Should only be used to << Entity[ Component ] >> data (e.g. insufficient mana)
     */
    constructor(afflictions = [], qualifier) {
        this.afflictions = afflictions;

        if(typeof qualifier === "function") {
            this.qualifier = qualifier;
        } else {
            this.qualifier = () => true;
        }
    }

    attempt(...args) {
        return this.qualifier(...args);
    }
};

export default Action;