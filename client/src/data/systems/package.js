import Map from "./Map";
import Node from "./Node";
import Portal from "./Portal";
import Position from "./Position";
import Terrain from "./Terrain";

export const Systems = {
	Map: Map,
	Node: Node,
	Position: Position,
	Terrain: Terrain,
	Portal: Portal,
};

export const loadSystemRegistry = game => {
	Object.entries(Systems).forEach(([ key, clazz ]) => {
		const system = new clazz(game);

		game.Systems.registerWithAlias(system, key);
	});

	return game;
};

export default Systems;