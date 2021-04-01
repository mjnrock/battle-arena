export class Ability {
    constructor(afflictions = [], { range = 0, cooldown = 0 } = {}) {
        this.afflictions = afflictions;

        this.range = range;
        this.cooldown = cooldown;

        this.lastUse = 0;
    }

    invoke(...flattenArgs) {
        if(Date.now() >= (this.lastUse + this.cooldown)) {
            return this.afflictions.map(aff => aff.flatten(...flattenArgs));
        }

        return false;
    }
};

export default Ability;