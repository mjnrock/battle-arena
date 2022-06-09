import Entity from "./../../../@agency/core/ecs/Entity";

export const EntityList = new Set([
	//TODO
]);

/**
 * Seed Entity Dictionary
 */
Entity.SeedMap(EntityList);

export default () => {
	Entity.SeedMap(EntityList);
};