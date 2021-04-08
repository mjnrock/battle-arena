import Agency from "@lespantsfancy/agency";
import Action from "./Action";
import Affliction from "./Affliction";

export const Name = "action";
export const Accessor = (key) => Agency.Registry._[ Name ][ key ];

export function init() {
    Agency.Registry._.register(new Agency.Registry(), Name);     // Create the registry

    const entries = {
        holyNova: () => new Action([
            Affliction.Surround4([
                Agency.Registry._.effect.heal,
            ]),
        ]),
    };

    //  Begin data loading
    for(let [ key, action ] of Agency.Util.Helper.flatten(entries, { asArray: true })) {
        Agency.Registry._[ Name ].register(action, key);
    }
}

export default init;