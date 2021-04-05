import Agency from "@lespantsfancy/agency";
import AgencyBase from "@lespantsfancy/agency/src/AgencyBase";

import NodeManager from "./manager/NodeManager"
import EntityManager from "./manager/EntityManager";
import Entity from "./entity/Entity";
import { DictTerrain } from "./entity/component/Terrain";
import { EnumEntityType } from "./entity/component/Meta";

import Node from "./util/Node";
import Portal from "./util/Portal";

import { CalculateEdgeMasks } from "./data/render/edges";

export class World extends Agency.Event.Emitter {
    constructor(size = [], { game, entities = [], portals = [], config = {} } = {}) {
        super();

        this.__game = game;
        this.__config = {
            ...config,

            spawn: config.spawn || [ 0, 0 ],
        };

        this.size = size;
        this._nodes = new NodeManager(this.size);

        this._entities = new EntityManager(this.game, entities);

        for(let [ x, y, portal ] of portals) {
            this.openPortal(x, y, portal);
        }
        for(let entity of entities) {
            this.joinWorld(entity);
        }
    }

    [ Symbol.iterator ]() {
        var index = -1;
        var data = this._nodes._nodes.toLeaf({ flatten: true });

        return {
            next: () => ({ value: data[ ++index ], done: !(index in data) })
        };
    }

    get id() {
        return this.__id;
    }
    get game() {
        return this.__game;
    }    
    get config() {
        return this.__config;
    }

    get spawn() {
        const [ x, y ] = this.__config.spawn;

        return { x, y };
    }

    get nodes() {
        return this._nodes;
    }
    get subnodes() {
        return this._nodes.nodes;
    }

    get entities() {
        return this._entities;
    }
    set entities(entityMgr) {
        this.resetEntities();

        if(entityMgr instanceof EntityManager) {
            this._entities = entityMgr;

            for(let entity of this._entities) {
                this.joinWorld(entity);
            }
        }

        return this;
    }
    resetEntities() {
        for(let entity of this._entities) {
            this.leaveWorld(entity);
        }

        this.nodes.clearCache();
        this.nodes.clearOccupants();

        return this;
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

    isWithinBounds(x, y) {
        return x >= 0 && (x <= this.width - 1)
            && y >= 0 && (y <= this.height - 1);
    }

    joinWorld(entity, ...synonyms) {
        this._entities.register(entity, ...synonyms);

        this._nodes.move(entity);

        this.$.emit("join", this, entity);
        
        return this;
    }
    leaveWorld(entity) {
        this._entities.unregister(entity);

        if(this._nodes.remove(entity)) {
            this.$.emit("leave", this, entity);

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
        this.__config.spawn = pos;

        return this;
    }

    node(x, y) {
        return this.nodes.node(
            ~~x,
            ~~y,
        );
        // return this.nodes.node(
        //     Agency.Util.Helper.round(x, 1),
        //     Agency.Util.Helper.round(y, 1),
        // );
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
        const node = this.nodes.node(x, y);

        if(node) {
            const entity = node.terrain;

            if(entity) {
                return entity.terrain.cost;
            }
        }

        return false;
    }

    getTerrain(x, y) {
        const node = this.nodes.node(x, y);

        if(node) {
            return node.terrain;
        }

        return false;
    }
    setTerrain(x, y, terrain) {
        const node = this.nodes.node(x, y);

        if(node) {
            node._terrain = terrain;

            return true;
        }

        return false;
    }
};

export function CreateRandom(game, width, height, enemyCount = 5) {
    const world = new World([ width, height ], { game });

    for(let x = 0; x < world.width; x++) {
        for(let y = 0; y < world.height; y++) {
            const terrain = Entity.FromSchema(game, [
                [ { meta: null }, { type: EnumEntityType.TERRAIN } ],
                [ { terrain: null }, Math.random() >= 0.35 ? DictTerrain.GRASS : DictTerrain.DIRT],
                [ { world: null }, { x, y, facing: 0 } ],
            ]);

            const node = world._nodes.node(x, y);
            if(node instanceof Node) {
                node._terrain = terrain;   
            }
        }
    }

    //FIXME The edge paradigm is not good; use the 1x1 -> 4x4 storage solution
    CalculateEdgeMasks(world);

    const entities = world.entities.createMany(enemyCount, [
        [ { meta: null }, { type: () => Agency.Util.Dice.coin() ? EnumEntityType.SQUIRREL : EnumEntityType.BUNNY } ],
        [ { world: null }, { world, x: () => Agency.Util.Dice.random(0, world.width - 1), y: () => Agency.Util.Dice.random(0, world.height - 1), facing: () => Agency.Util.Dice.random(0, 3) * 90 } ],
        [ { health: null }, { args: { current: () => Agency.Util.Dice.d10(), max: 10 } } ],
        [ { action: null}, {} ],
    ], (i) => `enemy-${ i }`);

    entities.forEach(entity => {
        world.joinWorld(entity);

        entity.world.world = world.id;
        if(entity.meta.type === EnumEntityType.BUNNY) {
            entity.world.speed = 1.5;
        } else if(entity.meta.type === EnumEntityType.SQUIRREL) {
            entity.world.speed = 2.0;
        }
    });

    return world;
}

World.CreateRandom = CreateRandom;

export default World;