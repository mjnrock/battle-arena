import Component from "./Component";

export class Terrain extends Component {
    static Name = "action";
    static DefaultProperties = () => ({
        type: "void",
        cost: Infinity,
        edges: 0,
        meta: 0,
    });

    constructor(game, entity, state = {}) {
        super(Terrain.Name, game, entity, {
            ...Terrain.DefaultProperties(),
            ...state,
        });
    }
};

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

export default Terrain;