import { v4 as uuidv4 } from "uuid";
import Agency from "@lespantsfancy/agency";

import EntityManager from "./manager/EntityManager";
import { hasPosition as hasComponentPosition } from "./data/entity/components/position";

import NodeManager from "./manager/NodeManager";

import componentMeta, { EnumEntityType } from "./data/entity/components/meta";
import componentPosition from "./data/entity/components/position";
import componentTurn from "./data/entity/components/turn";
import componentHealth from "./data/entity/components/health";
import componentAction from "./data/entity/components/movement";
import componentTerrain, { DictTerrain } from "./data/entity/components/terrain";
import { CalculateEdgeMasks } from "./data/render/edges";

import Entity from "./Entity";

export class World {
    constructor(width, height) {
        this.__id = uuidv4();

        this.width = width;
        this.height = height;

        this.entities = new EntityManager();
        this.terrain = new EntityManager();

        //TODO  Once <Model>s are added, put a reference in any <Node> where an <Entity> overlaps (x+/-w, y+/-h)
        this.nodes = new NodeManager([ width, height ], this.entities);  // Entities only
        // this.nodes = new NodeManager([ width, height ], this.entities, this.terrain);
    }

    get id() {
        return this.__id;
    }

    get node() {
        return this.nodes.node;   // fn
    }
    get range() {
        return this.nodes.range;  // fn
    }

    join(entity, ...synonyms) {
        if(!hasComponentPosition(entity)) {
            return false;
        }

        entity.position.world = this.id;

        this.entities.register(entity, ...synonyms);

        this.nodes.joinNode(entity);

        return true;
    }
    leave(entity) {
        this.entities.unregister(entity);

        entity.position.world = null;

        if(!this.nodes.leaveNode(entity)) {
            this.nodes.clearFromNodes(entity);
        }
        
        delete this.nodes._cache[ entity.__id ];
    }

    
    adjacent(x, y, addDiagonals = false) {
        let dirs = [
            [ 0, -1 ],
            [ 1, 0 ],
            [ 0, 1 ],
            [ -1, 0 ],
        ];

        if(addDiagonals) {
            dirs = [
                ...dirs,

                [ 1, -1 ],
                [ 1, 1 ],
                [ -1, 1 ],
                [ -1, -1 ],
            ]
        }

        const neighs = [];
        for(let [ dx, dy ] of dirs) {
            if((x + dx >= 0) && (x + dx < this.width) && (y + dy >= 0) && (y + dy < this.height)) {
                neighs.push([
                    x + dx,
                    y + dy,
                ]);
            }
        }

        return neighs;
    }

    cost(x, y) {
        const entity = this.terrain[ `${ x }.${ y }`];

        if(entity) {
            return entity.terrain.cost;
        }

        return false;
    }

    getTerrain(x, y) {
        return this.terrain[ `${ x },${ y }`];
    }
};

export function CreateRandom(width, height, enemyCount = 5) {
    const world = new World(width, height);

    for(let x = 0; x < world.width; x++) {
        for(let y = 0; y < world.height; y++) {
            world.terrain.create([
                [ componentTerrain, Math.random() >= 0.35 ? DictTerrain.GRASS : DictTerrain.DIRT ],
                [ componentPosition, { x, y, facing: 0 } ],
                [ componentTurn, { timeout: 0 } ],
            ], `${ x },${ y }`);
        }
    }

    CalculateEdgeMasks(world);

    world.entities.createMany(enemyCount, [
        [ componentMeta, { type: () => Agency.Util.Dice.coin() ? EnumEntityType.SQUIRREL : EnumEntityType.BUNNY } ],
        [ componentPosition, { world, x: () => Agency.Util.Dice.random(0, world.width - 1), y: () => Agency.Util.Dice.random(0, world.height - 1), facing: () => Agency.Util.Dice.random(0, 3) * 90 } ],
        [ componentHealth, { current: () => Agency.Util.Dice.d10(), max: 10 } ],
        [ componentTurn, { timeout: () => Date.now() - Agency.Util.Dice.random(0, 1499) } ],
    ], (i) => `enemy-${ i }`);

    return world;
}

World.CreateRandom = CreateRandom;

export default World;