import Agency from "@lespantsfancy/agency";
import Cooldown from "../util/Cooldown";
import Affliction from "./Affliction";

export class Ability extends Agency.Event.Emitter  {
    constructor({ action, range = 0, cooldown = 0, cost = [], requirement = [] } = {}) {
        super();

        this.action = action;
        this.cooldown = cooldown;
        this.range = range;
        this.cost = cost;       // actor => mana - 50...
        this.requirement = requirement;     // actor => level >= 5...
    }

    invoke(actor, { ...rest } = {}) {
        const argsObj = {
            source: actor,
            range: this.range,
            ...rest,
        };

        if(this.requirement.every(fn => fn(actor)) && this.action.attempt(argsObj)) {
            const afflictions = Affliction.Flatten(this.action.afflictions, argsObj);

            argsObj.afflictions = afflictions;

            this.costs.forEach(cost => cost(actor));
            this.cooldown = Cooldown.Generate(this.cooldown);
            this.$.emit("ability", argsObj);
        }
    }
}

export default Ability;