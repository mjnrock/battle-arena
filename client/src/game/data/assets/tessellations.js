import { AssetManager } from "../../lib/render/AssetManager";

/**
 * @alias String - The alias to use in the registry
 * @canvas String - The registry canvas alias to use for the tessellation
 * @algorithm Function - The algorithm to use for the tessellation
 * ? @args any - The arguments to pass to the algorithm
 */
export default [
	{
		alias: "grass",
		canvas: "terrain_grass",
		algorithm: AssetManager.Algorithms.GridBased({ directions: false }),
	},
	{
		alias: "grass_edge",
		canvas: "terrain_grass_edge",
		algorithm: AssetManager.Algorithms.GridBased({ directions: false }),
	},
	{
		alias: "water",
		canvas: "terrain_water",
		algorithm: AssetManager.Algorithms.GridBased({ directions: false }),
	},
	{
		alias: "squirrel",
		canvas: "entity_squirrel",
		algorithm: AssetManager.Algorithms.GridBased({ zones: [ "normal", "moving" ] }),
	},
	{
		alias: "bunny",
		canvas: "entity_bunny",
		algorithm: AssetManager.Algorithms.GridBased({ zones: [ "normal", "moving" ] }),
	},
];