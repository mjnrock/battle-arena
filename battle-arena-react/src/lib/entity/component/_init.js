import Agency from "@lespantsfancy/agency";

import World from "./World";
import Action from "./Action";
import Health from "./Health";
import Meta from "./Meta";
import Terrain from "./Terrain";
import Effect from "./Effect";
import State from "./State";
import Player from "./Player";

export const Name = "component";
export const Accessor = (key) => Agency.Registry._[ Name ][ key ];

export function init() {
    Agency.Registry._.register(new Agency.Registry(), Name);     // Create the registry

    const entries = {
        world: World,
        action: Action,
        health: Health,
        meta: Meta,
        terrain: Terrain,
        effect: Effect,
        state: State,
        player: Player,
    };

    //  Begin data loading
    for(let [ key, Class ] of Object.entries(entries)) {
        Agency.Registry._[ Name ].register((...args) => new Class(...args), key);
    }
}

export default init;