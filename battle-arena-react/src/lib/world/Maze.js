import maze from "amazejs";

import World from "./World";
import Portal from "./../util/Portal";
import Node from "./../util/Node";
import Action from "./../entity/component/Action";
import Entity from "./../entity/Entity";
import { EnumEntityCreatureType } from "./../entity/component/Meta";
import { DictTerrain } from "./../entity/component/Terrain";

export class Maze extends World {
    constructor(size = [], { parent, ...opts } = {}) {
        super(size, opts);

        this.maze = new maze.Backtracker(this.width, this.height);
        this.maze.generate();

        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                const terrain = Entity.FromSchema(this.game, {
                    meta: { type: EnumEntityCreatureType.TERRAIN },
                    state: {},
                    terrain: this.maze.get(y, x) ? DictTerrain.GRASS : DictTerrain.VOID,
                    world: { x, y, facing: 0 },
                });
    
                const node = this._nodes.node(x, y);
                if(node instanceof Node) {
                    node._terrain = terrain;   
                }
            }
        }

        this.__config.spawn = [ 1.5, 1.5 ];

        if(parent instanceof World) {
            this.openPortal(this.width - 2, this.height - 2, new Portal(parent, { activator: Action.IsInteracting }));
        }
    }

    onPreTick(spf, now) {
        super.onPreTick(spf, now);
    }
    onTick(dt, now) {
        super.onTick(dt, now);
    }
};

export function CreateRandom(game, width, height, parent) {
    const maze = new Maze([ width, height ], { game, parent });

    return maze;
}

Maze.CreateRandom = CreateRandom;

export default Maze;