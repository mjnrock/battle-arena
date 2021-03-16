import Agency from "@lespantsfancy/agency";

import EntityManager from "./manager/EntityManager";
import { hasPosition as hasComponentPosition } from "./data/entity/components/position";

import Beacon from "./util/Beacon";
import NodeManager from "./manager/NodeManager";

import componentMeta, { EnumEntityType } from "./data/entity/components/meta";
import componentPosition from "./data/entity/components/position";
import componentTurn from "./data/entity/components/turn";
import componentHealth from "./data/entity/components/health";
import componentAction from "./data/entity/components/movement";
import componentTerrain, { DictTerrain } from "./data/entity/components/terrain";
import { CalculateEdgeMasks } from "./data/render/edges";
import findPath from "./util/AStar";

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
        return this.terrain[ `${ x }.${ y }`];
    }
}

export function CreateRandom(width, height, enemyCount = 5) {
    const world = new World(width, height);

    for(let x = 0; x < world.width; x++) {
        for(let y = 0; y < world.height; y++) {
            world.terrain.create([
                [ componentTerrain, Math.random() >= 0.50 ? DictTerrain.GRASS : DictTerrain.DIRT ],
                [ componentPosition, { x, y, facing: 0 } ],
                [ componentTurn, { timeoutStart: 0 } ],
            ], `${ x }.${ y }`);
        }
    }
    
    CalculateEdgeMasks(world);

    world.entities.create([
        [ componentMeta, { type: EnumEntityType.SQUIRREL } ],
        [ componentPosition, { x: 4, y: 7 } ],
        [ componentHealth, { current: 10, max: 10 } ],
        [ componentAction, {} ],
        [ componentTurn, { timeoutStart: () => Agency.Util.Dice.random(0, 2499), current: () => (entity) => {
            if(entity.movement.path.length) {
                const [ x, y ] = entity.movement.path.shift();
                const { x: ox, y: oy } = entity.position;

                entity.position.x = x;
                entity.position.y = y;

                if(x !== ox) {
                    if(x > ox) {
                        entity.position.facing = 90;
                    } else if(x < ox) {
                        entity.position.facing = 270;
                    }
                } else if(y !== oy) {
                    if(y > oy) {
                        entity.position.facing = 180;
                    } else if(y < oy) {
                        entity.position.facing = 0;
                    }
                } 
    
                world.PLAYER_PATH = entity.movement.path;
            }
        } } ],
    ], "player");

    world.entities.createMany(enemyCount, [
        [ componentMeta, { type: () => Agency.Util.Dice.coin() ? EnumEntityType.SQUIRREL : EnumEntityType.BUNNY } ],
        [ componentPosition, { x: () => Agency.Util.Dice.random(0, world.width - 1), y: () => Agency.Util.Dice.random(0, world.height - 1), facing: () => Agency.Util.Dice.random(0, 3) * 90 } ],
        [ componentHealth, { current: () => Agency.Util.Dice.d10(), max: 10 } ],
        [ componentTurn, { timeoutStart: () => Date.now() - Agency.Util.Dice.random(0, 1499) } ],
    ], (i) => `enemy-${ i }`);

    return world;
}

World.CalculateEdgeMasks = CalculateEdgeMasks;
World.CreateRandom = CreateRandom;

export default World;