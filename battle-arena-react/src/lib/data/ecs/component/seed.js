import Component from "../../../@agency/core/ecs/Component";

import Animus from "../../../world/Animus";

import Position from "../struct/Position"
import Terrain from "./../struct/Terrain";

export const StructList = new Set([
	Position,
	Terrain,
]);

/**
 * Seed Component Dictionary
 */
Component.SeedMap(StructList);

Animus.Components = Component.Dictionary;