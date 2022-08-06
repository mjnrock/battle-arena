export const EnumTerrainType = {
	VOID: "void",
	WATER: "water",
	DIRT: "dirt",
	SAND: "sand",
	GRASS: "grass",
	STONE: "stone",
};

export const EnumEdgeFlag = {
	NONE: 0,
	TOP: 2 << 0,
	BOTTOM: 2 << 1,
	LEFT: 2 << 2,
	RIGHT: 2 << 3,
};
EnumEdgeFlag.TOP_LEFT = EnumEdgeFlag.TOP | EnumEdgeFlag.LEFT;
EnumEdgeFlag.TOP_RIGHT = EnumEdgeFlag.TOP | EnumEdgeFlag.RIGHT;
EnumEdgeFlag.BOTTOM_LEFT = EnumEdgeFlag.BOTTOM | EnumEdgeFlag.LEFT;
EnumEdgeFlag.BOTTOM_RIGHT = EnumEdgeFlag.BOTTOM | EnumEdgeFlag.RIGHT;
EnumEdgeFlag.ALL = EnumEdgeFlag.TOP | EnumEdgeFlag.BOTTOM | EnumEdgeFlag.LEFT | EnumEdgeFlag.RIGHT;

export function terrain({ type = EnumTerrainType.VOID, speed = 1, meta = {}, edges = EnumEdgeFlag.NONE } = {}) {
	return {
		/**
		 * The EnumTerrainType of the terrain
		 */
		type: type,

		/**
		 * The default speed of the terrain, which is used as the base speed for an entity traveling on this terrain
		 */
		speed: speed,

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