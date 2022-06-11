import MapSystem from "./MapSystem";
import NodeSystem from "./NodeSystem";

export const Systems = {
	Map: MapSystem,
	Node: NodeSystem,
};

export const loadSystemsRegistry = game => {
	Object.entries(Systems).forEach(([ key, clazz ]) => {
		const system = new clazz(game);

		game.Systems.registerWithAlias(system, key);
	});

	return game;
};

export default Systems;