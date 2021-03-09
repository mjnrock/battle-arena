import Agency from "@lespantsfancy/agency";

import EntityManager from "./manager/EntityManager";
import { hasPosition as hasComponentPosition } from "./data/entity/components/position";

import Beacon from "./util/Beacon";
import NodeManager from "./manager/NodeManager";

import componentPosition from "./data/entity/components/position";
import componentTurn from "./data/entity/components/turn";
import componentHealth from "./data/entity/components/health";
import componentTerrain, { DictTerrain } from "./data/entity/components/terrain";

export class World extends Beacon {
    constructor(width, height) {
        super();

        this.width = width;
        this.height = height;

        this.__entities = EntityManager.SubjectFactory(); // <Observer>-wrapped <Observable>
        this.__terrain = EntityManager.SubjectFactory();  // <Observer>-wrapped <Observable>

        //TODO Once <Model>s are added, put a reference in any <Node> where an <Entity> overlaps (x+/-w, y+/-h)
        this.__nodes = new NodeManager([ width, height ], this.__entities);  // Entities only
        // this.__nodes = new NodeManager([ width, height ], this.__entities, this.__terrain);
    }

    get entities() {
        return this.__entities.subject;
    }
    get terrain() {
        return this.__terrain.subject;
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

        this.entities.register(entity, ...synonyms);

        return true;
    }
    leave(entity) {
        this.entities.unregister(entity);

        if(!this.__nodes.__leaveNode(entity)) {
            this.__nodes.__clearFromNodes(entity);
        }
        
        delete this.__nodes.__cache[ entity.__id ];
    }
}

export function CreateRandom(width, height, enemyCount = 5) {
    const world = new World(width, height);

    for(let x = 0; x < world.width; x++) {
        for(let y = 0; y < world.height; y++) {
            world.terrain.create([
                [ componentTerrain, Math.random() <= 0.75 ? DictTerrain.GRASS : DictTerrain.WATER ],
                [ componentPosition, { x, y, facing: 0 } ],
                [ componentTurn, { timeoutStart: 0 } ],
            ], `${ x }.${ y }`);
        }
    }
    // console.log(world.terrain[ "3.4" ]);

    world.entities.create([
        [ componentPosition, { x: 4, y: 7 } ],
        [ componentHealth, { current: 10, max: 10 } ],
        [ componentTurn, { timeoutStart: () => Agency.Util.Dice.random(0, 2499) } ],
    ], "player");

    world.entities.createMany(enemyCount, [
        [ componentPosition, { x: () => Agency.Util.Dice.random(0, world.width - 1), y: () => Agency.Util.Dice.random(0, world.height - 1), facing: () => Agency.Util.Dice.random(0, 3) * 90 } ],
        [ componentHealth, { current: () => Agency.Util.Dice.d10(), max: 10 } ],
        [ componentTurn, { timeoutStart: () => Date.now() - Agency.Util.Dice.random(0, 1499) } ],
    ], (i) => `enemy-${ i }`);

    return world;
}

World.CreateRandom = CreateRandom;

export default World;