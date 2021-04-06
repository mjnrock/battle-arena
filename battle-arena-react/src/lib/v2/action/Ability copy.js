import Cooldown from "./../util/Cooldown";

export class Ability {
    constructor(afflictions = [], { range = 0, cooldown = 0 } = {}) {
        this.afflictions = afflictions;

        this.range = range;
        this.cooldown = new Cooldown(cooldown);
    }

    /**
     * << Entity >> should be passed for relative calculations (e.g. facing)
     */
    invoke(...flattenArgs) {
        if(this.cooldown.isComplete) {
            this.cooldown = Cooldown.Generate(this.cooldown);

            return this.afflictions.map(aff => aff.flatten(...flattenArgs));
        }

        return false;
    }

    static Generate(...args) {
        if(args[ 0 ] instanceof Ability) {
            const ability = args[ 0 ];

            return new Ability(ability.afflictions, { range: ability.range, cooldown: ability.cooldown.duration });
        }

        return new Ability(...args);
    }
};

export default Ability;