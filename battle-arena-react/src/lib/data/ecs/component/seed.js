import Component from "../../../@agency/core/ecs/Component";

import Animus from "../../../world/Animus";

import Locamotive from "../struct/Locamotive"
import Terrain from "./../struct/Terrain";

export const StructList = new Set([
	Locamotive,
	Terrain,
]);

/**
 * Seed Component Dictionary
 */
Component.SeedMap(StructList);

Animus.Components = Component.Dictionary;