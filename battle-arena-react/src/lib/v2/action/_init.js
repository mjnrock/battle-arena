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
                Affliction.Caster([ 
                    [ Agency.Registry._.effect.heal, { amount: 1 } ],
                ]),
                Affliction.Surround4([ 
                    [ Agency.Registry._.effect.heal, { amount: 1 } ],
                ]),
            ]),
            cooldown: 750,
            cost: [],
            requirement: [],
            range: 0,
        }),
    };

    //  Begin data loading
    for(let [ key, action ] of Agency.Util.Helper.flatten(entries, { asArray: true })) {
        Agency.Registry._[ Name ].register(action, key);
    }
}

export default init;