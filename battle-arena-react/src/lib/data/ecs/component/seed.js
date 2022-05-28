import Component from "../../../@agency/core/ecs/Component";

import Animus from "../../../world/Animus";

import Physics from "../struct/Physics"
import Terrain from "./../struct/Terrain";

export const StructList = new Set([
	Physics,
	Terrain,
]);
/**
 * Seed Component Dictionary
 */
Component.SeedMap(StructList);

Animus.Components = Component.Dictionary;

export default () => {
	Component.SeedMap(StructList);
	Animus.Components = Component.Dictionary;
};