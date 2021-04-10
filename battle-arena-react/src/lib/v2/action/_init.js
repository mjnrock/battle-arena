import Agency from "@lespantsfancy/agency";
import Ability from "./Ability";
import Action from "./Action";
import Affliction from "./Affliction";

export const Name = "ability";
export const Accessor = (key) => Agency.Registry._[ Name ][ key ];

export function init() {
    Agency.Registry._.register(new Agency.Registry(), Name);     // Create the registry

    const entries = {
        holyNova: () => new Ability({
            action: new Action([
                Affliction.Current([ 
                    [ Agency.Registry._.effect.heal, { amount: 1 } ],
                ]),
                Affliction.Surround8([ 
                    [ Agency.Registry._.effect.heal, { amount: 1 } ],
                ]),
            ]),
            cooldown: 750,
            cost: [],
            requirement: [
                entity => entity.health.value.rate > 0.5,   // Must have at least half health to cast
            ],
            range: 0,
            ...Ability.MaxAffected(5),                  // Max hits = 5
            priority: ({ target, source }) => {         // Prioritize lower health
                return 1 - target.health.value.rate;
            }
        }),
        holyLight: () => new Ability({
            action: new Action([
                Affliction.Current([ 
                    [ Agency.Registry._.effect.heal, { amount: 5 } ],
                ]),
            ]),
            cooldown: 2500,
            cost: [],
            requirement: [],
            range: 3,
            targeted: true,                                         // Must hit a target<Entity>
            escape: ({ affected, target }) => affected.size > 0,    // Max hits = 1
            priority: ({ target, source }) => {                     // Prioritize (harmed) self, deprioritize *all* full health
                if(target.health.value.rate >= 1) {
                    return -Infinity;
                }

                if(target === source) {
                    return Infinity;
                }

                return 1;
            }
        }),
    };

    //  Begin data loading
    for(let [ key, ability ] of Agency.Util.Helper.flatten(entries, { asArray: true })) {
        Agency.Registry._[ Name ].register(ability, key);
    }
}

export default init;