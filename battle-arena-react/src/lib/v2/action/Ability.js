import Agency from "@lespantsfancy/agency";
import Affliction from "./Affliction";

export class Ability extends Agency.Event.Emitter  {
    constructor({ action, range = 0, cooldown = 0, castTime = 0, cost = [], requirement = [], priority, escape, targeted = false } = {}) {
        super();

        //  Remove these properties from enumeration
        Reflect.defineProperty(this, "action", { value: action });
        Reflect.defineProperty(this, "requirement", { value: requirement }); // actor => level >= 5...

        this.range = range;
        this.cooldown = cooldown;
        this.castTime = castTime;
        this.cost = cost;       // actor => mana - 50...
        this.targeted = targeted;
        this.escape = escape || (() => false);
        this.priority = priority;
    }

    invoke(actor, { ...rest } = {}) {
        const argsObj = {
            source: actor,
            affected: new Set(),
            ...this,
            ...rest,
        };

        if(this.requirement.every(fn => fn(actor)) && this.action.attempt(argsObj)) {
            argsObj.afflictions = Affliction.Flatten(this.action.afflictions, argsObj);
            
            actor.$.emit("casting", actor, {
                startTime: Date.now(),
                duration: this.castTime,
                ability: argsObj,
            });

            this.__deconstructor();

            return true;
        }

        return false;
    }

    //FIXME A lot of this Ability-related stuff should be placed in more structured ways
    static RangeCheck(x1, y1, x2, y2, range) {
        return (Math.abs(~~x1 - ~~x2) + Math.abs(~~y1 - ~~y2)) <= range;
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