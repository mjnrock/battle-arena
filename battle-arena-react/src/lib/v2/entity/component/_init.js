import Agency from "@lespantsfancy/agency";

import World from "./World";
import Action from "./Action";
import Health from "./Health";
import Meta from "./Meta";
import Terrain from "./Terrain";

export const Name = "component";
export const Accessor = (key) => Agency.Registry._[ Name ][ key ];

export function init() {
    Agency.Registry._.register(new Agency.Registry(), Name);     // Create the registry

    const entries = [
        [ "world", World ],
        [ "action", Action ],
        [ "health", Health ],
        [ "meta", Meta ],
        [ "terrain", Terrain ],
    ];

    //  Begin data loading
    for(let [ key, Class ] of entries) {
        Agency.Registry._[ Name ].register((game, entity, argObj) => new Class(game, entity, argObj), key);
    }
}

export default init;