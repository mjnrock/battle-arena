import Agency from "@lespantsfancy/agency";
import Cooldown from "../util/Cooldown";
import Affliction from "./Affliction";

export class Ability extends Agency.Event.Emitter  {
    constructor({ action, range = 0, cooldown = 0, cost = [], requirement = [], priority, escape } = {}) {
        super();

        this.action = action;
        this.cooldown = cooldown;
        this.range = range;
        this.cost = cost;       // actor => mana - 50...
        this.requirement = requirement;     // actor => level >= 5...
        this.escape = escape || (() => false);
        this.priority = priority;
    }

    invoke(actor, { ...rest } = {}) {
        const argsObj = {
            source: actor,
            range: this.range,
            cost: this.cost,
            cooldown: this.cooldown,
            affected: new Set(),
            escape: this.escape,
            priority: this.priority,
            ...rest,
        };

        if(this.requirement.every(fn => fn(actor)) && this.action.attempt(argsObj)) {
            const afflictions = Affliction.Flatten(this.action.afflictions, argsObj);

            argsObj.afflictions = afflictions;
            this.$.emit("ability", argsObj);

            return true;
        }

        return false;
    }

    static MaxAffected(amount = 1) {
        return {
            escape: ({ affected }) => affected.size >= amount,
        };
    }

    static PrioritizeSelf() {
        return {
            priority: ({ target, source }) => {
                if(target === source) {
                    return Infinity;
                }

                return 1;
            },
        };
    }
    static DeprioritizeSelf() {
        return {
            priority: ({ target, source }) => {
                if(target === source) {
                    return -Infinity;
                }

                return 1;
            },
        };
    }
}

export default Ability;