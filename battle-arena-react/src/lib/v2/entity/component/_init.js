import Agency from "@lespantsfancy/agency";

import World from "./World";
import Action from "./Action";
import Health from "./Health";
import Meta from "./Meta";
import Terrain from "./Terrain";

export function init() {
    const synonym = "component";

    Agency.Registry._.register(new Agency.Registry(), synonym);     // Create the registry

    const entries = [
        [ "world", World ],
        [ "action", Action ],
        [ "health", Health ],
        [ "meta", Meta ],
        [ "terrain", Terrain ],
    ];

    //  Begin data loading
    for(let [ key, Class ] of entries) {
        Agency.Registry._[ synonym ].register((game, entity, argObj) => new Class(game, entity, argObj), key);
    }
}

export default init;