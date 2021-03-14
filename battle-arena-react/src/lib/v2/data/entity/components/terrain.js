import Agency from "@lespantsfancy/agency";

//! Component Schemas should always be functions
const _name = "terrain";

export function TerrainLookup(type) {
    switch(type) {
        case DictTerrain.VOID.type:
            return "void";
        case DictTerrain.GRASS.type:
            return "grass";
        case DictTerrain.DIRT.type:
            return "dirt";
        case DictTerrain.WATER.type:
            return "water";
        default:
            return "void";
    }
};

export const EnumEdgeMask = {
    NORTH: 2 << 0,
    EAST: 2 << 1,
    SOUTH: 2 << 2,
    WEST: 2 << 3,

    // Practically speaking, these will often functionally be a combination in INNER scenarios; but explicated for OUTER scenarios and for completeness
    NORTHEAST: 2 << 4,  // This represents a corner, NOT a combination
    SOUTHEAST: 2 << 5,  // This represents a corner, NOT a combination
    NORTHWEST: 2 << 6,  // This represents a corner, NOT a combination
    SOUTHWEST: 2 << 7,  // This represents a corner, NOT a combination
};

export const EnumConnectivityMask = {
    UP: 2 << 0,
    RIGHT: 2 << 1,
    DOWN: 2 << 2,
    LEFT: 2 << 3,
};

//? The key is meant to be used in an *equality* comparison
export const ConnectivityEdgeMap = {
    //  None (e.g. a singularly-isolated *dirt* tile completely surrounded by *grass*--i.e. edges in all directions)
    0: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.EAST,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.WEST,
        EnumEdgeMask.NORTHEAST,
        EnumEdgeMask.NORTHWEST,
        EnumEdgeMask.SOUTHEAST,
        EnumEdgeMask.SOUTHWEST,
    ),

    //  All (e.g. a *dirt* tile completely surrounded by *dirt*--i.e. no edges)
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.UP,
        EnumConnectivityMask.RIGHT,
        EnumConnectivityMask.DOWN,
        EnumConnectivityMask.LEFT,
    )]: 0, 

    // Single Connection
    [ EnumConnectivityMask.UP ]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.WEST,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.EAST,
        EnumEdgeMask.SOUTHWEST,
        EnumEdgeMask.SOUTHEAST,
    ),
    [ EnumConnectivityMask.RIGHT ]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.WEST,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.NORTHWEST,
        EnumEdgeMask.SOUTHWEST,
    ),
    [ EnumConnectivityMask.DOWN ]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.WEST,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.EAST,
        EnumEdgeMask.NORTHWEST,
        EnumEdgeMask.NORTHEAST,
    ),
    [ EnumConnectivityMask.LEFT ]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.EAST,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.NORTHEAST,
        EnumEdgeMask.SOUTHEAST,
    ),
    
    // Two Connections
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.UP,
        EnumConnectivityMask.RIGHT,
    )]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.WEST,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.SOUTHWEST,
        EnumEdgeMask.NORTHEAST,
    ),
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.RIGHT,
        EnumConnectivityMask.DOWN,
    )]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.WEST,
        EnumEdgeMask.NORTHWEST,
        EnumEdgeMask.SOUTHEAST,
    ),
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.LEFT,
        EnumConnectivityMask.DOWN,
    )]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.EAST,
        EnumEdgeMask.NORTHEAST,
        EnumEdgeMask.SOUTHWEST,
    ),
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.UP,
        EnumConnectivityMask.LEFT,
    )]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.EAST,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.SOUTHEAST,
        EnumEdgeMask.NORTHWEST,
    ),
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.LEFT,
        EnumConnectivityMask.RIGHT,
    )]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.SOUTH,
    ),
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.UP,
        EnumConnectivityMask.DOWN,
    )]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.EAST,
        EnumEdgeMask.WEST,
    ),
    
    //  Three Connections
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.UP,
        EnumConnectivityMask.RIGHT,
        EnumConnectivityMask.DOWN,
    )]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.WEST,
        EnumEdgeMask.NORTHEAST,
        EnumEdgeMask.SOUTHEAST,
    ),
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.RIGHT,
        EnumConnectivityMask.DOWN,
        EnumConnectivityMask.LEFT,
    )]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.SOUTHEAST,
        EnumEdgeMask.SOUTHWEST,
    ),
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.DOWN,
        EnumConnectivityMask.LEFT,
        EnumConnectivityMask.UP,
    )]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.EAST,
        EnumEdgeMask.SOUTHWEST,
        EnumEdgeMask.NORTHWEST,
    ),
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.LEFT,
        EnumConnectivityMask.UP,
        EnumConnectivityMask.RIGHT,
    )]: Agency.Util.Bitwise.add(0,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.NORTHWEST,
        EnumEdgeMask.NORTHEAST,
    ),
};

export const DictTerrain = {
    VOID: {
        type: 0,
        cost: Infinity,
    },
    GRASS: {
        type: 1,
        cost: 1,
    },
    DIRT: {
        type: 2,
        cost: 1,
    },
    WATER: {
        type: 3,
        cost: 5,
    },
};

export const schema = {
    [ _name ]: ({ type, cost, state = 0 } = {}) => ({
        type,
        cost,
        state,
    }),
};

export function hasTerrain(entity = {}) {
    return _name in entity;
}

export default schema;