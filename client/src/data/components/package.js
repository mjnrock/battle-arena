import Registry, { Name as RegistryName } from "./Registry";
import Position, { Name as PositionName }  from "./Position";

export const Components = {
	[ RegistryName ]: Registry,
	[ PositionName ]: Position,
};

export const loadComponentRegistry = game => {
	Object.entries(Components).forEach(([ key, clazz ]) => {
		const system = new clazz(game);

		game.Components.registerWithAlias(system, key);
	});

	return game;
};

export default Components;