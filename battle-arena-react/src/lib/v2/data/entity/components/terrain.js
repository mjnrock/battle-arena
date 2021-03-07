//! Component Schemas should always be functions
const _name = "terrain";

export function TerrainLookup(type) {
    switch(type) {
        case DictTerrain.VOID.type:
            return "void";
        case DictTerrain.GRASS.type:
            return "grass";
        case DictTerrain.WATER.type:
            return "water";
        default:
            return "void";
    }
};

export const DictTerrain = {
    VOID: {
        type: 0,
        cost: 0,
    },
    GRASS: {
        type: 1,
        cost: 1,
    },
    WATER: {
        type: 2,
        cost: 4,
    },
};

export const schema = {
    [ _name ]: ({ type, cost } = {}) => ({
        type,
        cost,
    }),
};

export function hasTerrain(entity = {}) {
    return _name in entity;
}

export default schema;