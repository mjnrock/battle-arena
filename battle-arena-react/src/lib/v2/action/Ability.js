import Agency from "@lespantsfancy/agency";
import Cooldown from "../util/Cooldown";
import Affliction from "./Affliction";

export class Ability extends Agency.Event.Emitter  {
    constructor({ action, range = 0, cooldown = 0, cost = [], requirement = [] } = {}) {
        super();

        this.action = action;
        this.cooldown = cooldown;
        this.range = range;
        this.cost = cost;
        this.requirement = requirement;
    }

    invoke(actor, { ...rest } = {}) {
        const argsObj = {
            source: actor,
            action: {
                range: this.range,
                costs: this.cost,
                cooldown: this.cooldown instanceof Cooldown ? this.cooldown.duration : +this.cooldown,
            },
            ...rest,
        };

        if(this.requirement.every(fn => fn(argsObj)) && this.action.attempt(argsObj)) {
            const afflictions = Affliction.Flatten(this.action.afflictions, argsObj);

            argsObj.action.afflictions = afflictions;

            this.$.emit("ability", argsObj);
        }
    }
}

export default Ability;