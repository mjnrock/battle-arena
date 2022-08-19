export const Name = `terrain`;

export const TerrainType = {
	VOID: `void`,
	WATER: `water`,
	DIRT: `dirt`,
	GRASS: `grass`,
};

export function Terrain({ type = TerrainType.VOID, cost = 1, edgeMask = 0, isNavigable = true } = {}) {
	return {
		type,
		cost,
		edgeMask,
		isNavigable,
	};
};

export const DefaultPair = [ Name, Terrain ];

export default Terrain;