import World from "./World";

import componentPosition from "./data/entity/components/position";
import componentTurn from "./data/entity/components/turn";
import componentTerrain, { DictTerrain } from "./data/entity/components/terrain";
import { CalculateEdgeMasks } from "./data/render/edges";

export class Arena extends World {
    constructor(overworld, width, height) {
        super(width, height);

        this.__overworld = overworld;
    }

    get overworld() {
        return this.__overworld;
    }
};

export function CreateArena(overworld, width, height, { schemaArray = [], enemyCount, entities = [] } = {}) {
    const arena = new Arena(overworld, width, height);

    for(let x = 0; x < arena.width; x++) {
        for(let y = 0; y < arena.height; y++) {
            arena.terrain.create([
                // [ componentTerrain, Math.random() >= 0.35 ? DictTerrain.GRASS : DictTerrain.DIRT ],
                [ componentTerrain, DictTerrain.DIRT ],
                [ componentPosition, { x, y, facing: 0 } ],
                [ componentTurn, { timeout: 0 } ],
            ], `${ x }.${ y }`);
        }
    }
    
    CalculateEdgeMasks(arena);

    for(let entity of entities) {
        arena.join(entity);
    }

    arena.entities.createMany(enemyCount, schemaArray, (i) => `enemy-${ i }`);

    return arena;
};

Arena.CreateArena = CreateArena;

export default Arena;