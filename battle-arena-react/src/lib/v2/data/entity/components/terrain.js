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
    [ _name ]: ({ type, cost, edges = 0, meta = 0 } = {}) => ({
        type,
        cost,
        edges,
        meta,
    }),
};

export function hasTerrain(entity = {}) {
    return _name in entity;
}

export default schema;