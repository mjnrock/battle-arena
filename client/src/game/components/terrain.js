export const EnumTerrainType = {
	VOID: "void",
	WATER: "water",
	DIRT: "dirt",
	SAND: "sand",
	GRASS: "grass",
	STONE: "stone",
};

export const EnumEdgeFlag = {
	TOP: 2 << 0,
	BOTTOM: 2 << 1,
	LEFT: 2 << 2,
	RIGHT: 2 << 3,
	TOP_LEFT: 2 << 4,
	TOP_RIGHT: 2 << 5,
	BOTTOM_LEFT: 2 << 6,
	BOTTOM_RIGHT: 2 << 7,
};
EnumEdgeFlag.NONE = 0;
EnumEdgeFlag.ALL_4 = EnumEdgeFlag.TOP | EnumEdgeFlag.BOTTOM | EnumEdgeFlag.LEFT | EnumEdgeFlag.RIGHT;
EnumEdgeFlag.ALL_4X = EnumEdgeFlag.TOP_LEFT | EnumEdgeFlag.TOP_RIGHT | EnumEdgeFlag.BOTTOM_LEFT | EnumEdgeFlag.BOTTOM_RIGHT;
EnumEdgeFlag.ALL = EnumEdgeFlag.ALL_4 | EnumEdgeFlag.ALL_4D;

export function terrain({ type = EnumTerrainType.VOID, cost = 1, meta = {}, edges = EnumEdgeFlag.NONE } = {}) {
	return {
		/**
		 * The EnumTerrainType of the terrain
		 */
		type: type,

		/**
		 * The default cost of the terrain, which is used as the base cost for an entity traveling on this terrain
		 */
		cost: cost,

		/**
		 * The meta data of the terrain
		 */
		meta: meta,

		/**
		 * A bitmask of the edges of the terrain, used primarily for rendering adjacent tiles
		 */
		edges: edges,
	};
};

export default terrain;