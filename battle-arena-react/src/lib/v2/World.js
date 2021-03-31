import EventEmitter from "events";
import Agency from "@lespantsfancy/agency";
import { v4 as uuidv4 } from "uuid";

import Node from "./util/Node";
import NodeManager from "./manager/NodeManager"
import Portal from "./util/Portal";
import Path from "./util/Path";

import componentMeta, { EnumEntityType } from "./data/entity/components/meta";
import componentPosition, { hasPosition as hasComponentPosition }  from "./data/entity/components/position";
import componentMovement from "./data/entity/components/movement";
import componentTurn from "./data/entity/components/turn";
import componentHealth from "./data/entity/components/health";
import componentTerrain, { DictTerrain } from "./data/entity/components/terrain";
import { CalculateEdgeMasks } from "./data/render/edges";
import EntityManager from "./manager/EntityManager";

export class World extends EventEmitter {
    static Events = [
        "join",
        "leave",
    ];

    constructor(size = [], { game, entities = [], portals = [], namespace, config = {} } = {}) {
        super();

        this.__id = uuidv4();
        this.__game = game;

        this.size = size;
        this._nodes = new NodeManager(this.size, { namespace });

        this._entities = new EntityManager(this.game, entities);
        this._terrain = new EntityManager(this.game);

        this._config = {
            ...config,

            spawn: config.spawn || [ 0, 0 ],
        };

        for(let [ x, y, portal ] of portals) {
            this.openPortal(x, y, portal);
        }
        for(let entity of entities) {
            this.joinWorld(entity);
        }
    }

    get id() {
        return this.__id;
    }
    get game() {
        return this.__game;
    }

    get nodes() {
        return this._nodes;
    }
    get entities() {
        return this._entities;
        // return this._entities.emitters;
    }
    get terrain() {
        return this._terrain;
        // return this._entities.emitters;
    }
    get subnodes() {
        return this._nodes.nodes;
    }
    get overworld() {
        return this._overworld;
    }
    get config() {
        return this._config;
    }

    get width() {
        return this.size[ 0 ];
    }
    get height() {
        return this.size[ 1 ];
    }
    get dim() {
        return dim => this.size[ dim ];
    }

    joinWorld(entity, ...synonyms) {
        this._entities.register(entity, ...synonyms);
        // this._entities.join(entity, ...synonyms)

        this._nodes.move(entity);

        this.emit("join", this, entity);
        
        return this;
    }
    leaveWorld(entity) {
        this._entities.unregister(entity);
        // this._entities.join(entity);

        if(this._nodes.remove(entity)) {
            this.emit("leave", this, entity);

            return true;
        }

        return false;
    }

    openPortal(x, y, portal) {
        const node = this.subnodes.get(x, y);

        if(node instanceof Node && portal instanceof Portal) {
            node.portals.add(portal);

            return true;
        }

        return false;
    }
    closePortal(x, y, portal) {
        const node = this.subnodes.get(x, y);

        if(node instanceof Node && portal instanceof Portal) {
            node.portals.delete(portal);

            return true;
        }

        return false;
    }


    setSpawnPoint(...pos) {
        this._config.spawn = pos;

        return this;
    }

    node(x, y) {
        return this.nodes.node(
            Agency.Util.Helper.round(x, 1),
            Agency.Util.Helper.round(y, 1),
        );
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
        const entity = this.terrain[ `${ x },${ y }`];

        if(entity) {
            return entity.terrain.cost;
        }

        return false;
    }

    getTerrain(x, y) {
        return this.terrain[ `${ x },${ y }`];
    }
};

export function CreateRandom(game, width, height, enemyCount = 5) {
    const world = new World([ width, height ], { game });

    for(let x = 0; x < world.width; x++) {
        for(let y = 0; y < world.height; y++) {
            world.terrain.create([
                [ componentTerrain, Math.random() >= 0.35 ? DictTerrain.GRASS : DictTerrain.DIRT ],
                [ componentPosition, { x, y, facing: 0 } ],
                [ componentTurn, { timeout: 0 } ],
            ], `${ x },${ y }`);
        }
    }

    // CalculateEdgeMasks(world);

    const entities = world.entities.createMany(enemyCount, [
        [ componentMeta, { type: () => Agency.Util.Dice.coin() ? EnumEntityType.SQUIRREL : EnumEntityType.BUNNY } ],
        [ componentPosition, { world, x: () => Agency.Util.Dice.random(0, world.width - 1), y: () => Agency.Util.Dice.random(0, world.height - 1), facing: () => Agency.Util.Dice.random(0, 3) * 90 } ],
        [ componentHealth, { current: () => Agency.Util.Dice.d10(), max: 10 } ],
        [ componentMovement, {} ],
        [ componentTurn, { timeout: () => Agency.Util.Dice.random(0, 2499), current: () => (entity) => {
            if(!entity.movement.wayfinder.hasPath && Agency.Util.Dice.percento(0.10)) {
                const [ tx, ty ] = [ Agency.Util.Dice.random(0, world.width - 1), Agency.Util.Dice.random(0, world.height - 1) ];
                const path = Path.FindPath(world, [ entity.position.x, entity.position.y ], [ tx, ty ]);

                entity.movement.wayfinder.set(path);
            } else if(entity.movement.wayfinder.hasPath ) {
                if(entity.movement.wayfinder.isCurrentDestination(entity.position)) {
                    const [ tx, ty ] = [ Agency.Util.Dice.random(0, world.width - 1), Agency.Util.Dice.random(0, world.height - 1) ];
                    const path = Path.FindPath(world, [ entity.position.x, entity.position.y ], [ tx, ty ]);
    
                    entity.movement.wayfinder.set(path);
                }
            }
        } } ],
    ], (i) => `enemy-${ i }`);

    entities.forEach(entity => {
        world.joinWorld(entity);

        entity.position.world = world.id;
        if(entity.meta.type === EnumEntityType.BUNNY) {
            entity.movement.speed = 1.5;
        } else if(entity.meta.type === EnumEntityType.SQUIRREL) {
            entity.movement.speed = 2.0;
        }
    });

    return world;
}

World.CreateRandom = CreateRandom;

export default World;