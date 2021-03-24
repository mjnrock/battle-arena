import { v4 as uuidv4 } from "uuid";
import Agency from "@lespantsfancy/agency";

import EntityManager from "./manager/EntityManager";
import { hasPosition as hasComponentPosition } from "./data/entity/components/position";

import NodeManager from "./manager/NodeManager";

import componentMeta, { EnumEntityType } from "./data/entity/components/meta";
import componentPosition from "./data/entity/components/position";
import componentTurn from "./data/entity/components/turn";
import componentHealth from "./data/entity/components/health";
import componentTerrain, { DictTerrain } from "./data/entity/components/terrain";
import { CalculateEdgeMasks } from "./data/render/edges";

export class World {
    constructor(width, height) {
        this.__id = uuidv4();

        this.width = width;
        this.height = height;

        this.entities = new EntityManager();
        this.terrain = new EntityManager();

        this.__nodes = new NodeManager([ width, height ], [ this.entities ]);
    }

    get id() {
        return this.__id;
    }

    get nodes() {
        return this.__nodes.nodes;  // Agency..CrossMap
    }
    get node() {
        return this.__nodes.node;   // fn
    }
    get range() {
        return this.__nodes.range;  // fn
    }

    join(entity, ...synonyms) {
        if(!hasComponentPosition(entity)) {
            return false;
        }

        entity.position.world = this.id;

        this.entities.register(entity, ...synonyms);

        this.__nodes.joinNode(entity);

        return true;
    }
    leave(entity) {
        this.entities.unregister(entity);

        entity.position.world = null;

        if(!this.__nodes.leaveNode(entity)) {
            this.__nodes.clearFromNodes(entity);
        }
        
        delete this.__nodes._cache[ entity.__id ];
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

    const entities = world.entities.createMany(enemyCount, [
        [ componentMeta, { type: () => Agency.Util.Dice.coin() ? EnumEntityType.SQUIRREL : EnumEntityType.BUNNY } ],
        [ componentPosition, { world, x: () => Agency.Util.Dice.random(4, 6), y: () => Agency.Util.Dice.random(7, 9), facing: () => Agency.Util.Dice.random(0, 3) * 90 } ],
        // [ componentPosition, { world, x: () => Agency.Util.Dice.random(0, world.width - 1), y: () => Agency.Util.Dice.random(0, world.height - 1), facing: () => Agency.Util.Dice.random(0, 3) * 90 } ],
        [ componentHealth, { current: () => Agency.Util.Dice.d10(), max: 10 } ],
        [ componentTurn, { timeout: () => Date.now() - Agency.Util.Dice.random(0, 999), current: () => () => false } ],
    ], (i) => `enemy-${ i }`);

    entities.forEach(entity => world.join(entity));

    return world;
}

World.CreateRandom = CreateRandom;

export default World;