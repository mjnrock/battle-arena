import Agency from "@lespantsfancy/agency";

import NodeManager from "../_archive/manager/NodeManager"
import EntityManager from "../_archive/manager/EntityManager";
import Entity from "../entity/Entity";
import { DictTerrain } from "../entity/component/Terrain";
import { EnumEntityCreatureType } from "../entity/component/Meta";

import Node from "./lib/Node";
import Portal from "./lib/Portal";

import { Repository as ActionRepository } from "../entity/component/Action";

import { CalculateEdgeMasks } from "../data/render/edges";
import VideoSource from "./lib/VideoSource";

export class World extends Agency.Event.Emitter {
    constructor(size = [], { game, entities = [], portals = [], config = {} } = {}, opts = {}) {
        super({}, { injectMiddleware: true, ...opts });

        this.__game = game;
        this.__config = {
            ...config,

            //!GRID-NUDGE
            spawn: config.spawn || [ 0.5, 0.5 ],
        };

        this.size = size;
        this._nodes = new NodeManager(this.size);

        this._entities = new EntityManager(this.game, entities);

        this.videoSource = new VideoSource(this.game, this);

        for(let [ x, y, portal ] of portals) {
            this.openPortal(x, y, portal);
        }
        for(let entity of entities) {
            this.joinWorld(entity);
        }
    }

    __destroy(destroyEntities = true) {
        for(let node of this._nodes._nodes.toLeaf({ flatten: true })) {
            node.__destroy();
        }
        
        if(destroyEntities) {
            for(let entity of this._entities) {
                this._entities.unregister(entity);
                entity.__destroy();
            }
        }
        
        for(let key in this) {
            delete this[ key ];
        }
        
        this.__deconstructor();
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

    create(comps = {}, ...synonyms) {
        const entity = this.entities.create(comps, ...synonyms);

        this.joinWorld(entity);

        return this;
    }
    createMany(qty, comps = {}, synonymFunction) {
        const entities = this.entities.createMany(qty, comps, synonymFunction);

        for(let entity of entities) {
            this.joinWorld(entity);
        }

        return this;
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

    //NOTE  Do not break this down further (e.g. creating << Entity.onTick >>), as it will hinder/break the "World-Constrained Behavior" paradigm necessary for mixing real-time with turn-based
    onPreTick(spf, now) {
        for(let entity of this.entities) {
            for(let comp of entity) {
                comp.onPreTick.call(comp, spf, now);
            }
        }
    }
    onTick(dt, now) {
        for(let entity of this.entities) {
            for(let comp of entity) {
                comp.onTick.call(comp, dt, now);
            }
        }
    }
    onDraw(dt, now) {}
};

export function CreateRandom(game, width, height, enemyCount = 5) {
    const world = new World([ width, height ], { game });

    for(let x = 0; x < world.width; x++) {
        for(let y = 0; y < world.height; y++) {
            const terrain = Entity.FromSchema(game, {
                meta: { type: EnumEntityCreatureType.TERRAIN },
                state: {},
                terrain: Math.random() >= 0.35 ? DictTerrain.GRASS : DictTerrain.DIRT,
                world: { x, y, facing: 0 },
            });

            const node = world._nodes.node(x, y);
            if(node instanceof Node) {
                node._terrain = terrain;   
            }
        }
    }

    //FIXME The edge paradigm is not good; use the 1x1 -> 4x4 storage solution
    CalculateEdgeMasks(world);

    const entities = world.entities.createMany(enemyCount, {
        meta: { subtype: () => Agency.Util.Dice.coin() ? EnumEntityCreatureType.SQUIRREL : EnumEntityCreatureType.BUNNY },
        state: {},
        //!GRID-NUDGE
        world: { world, x: () => Agency.Util.Dice.random(0, world.width - 1) + 0.5, y: () => Agency.Util.Dice.random(0, world.height - 1) + 0.5, facing: () => Agency.Util.Dice.random(0, 3) * 90 },
        health: { args: { current: () => Agency.Util.Dice.d10(), max: 10 } },
        action: {
            ai: () => ActionRepository.AI.Test
        },
    }, (i) => `enemy-${ i }`);

    entities.forEach(entity => {
        world.joinWorld(entity);

        if(entity.meta.subtype === EnumEntityCreatureType.BUNNY) {
            entity.world.speed = 1.5;
        } else if(entity.meta.subtype === EnumEntityCreatureType.SQUIRREL) {
            entity.world.speed = 2.0;
        }
    });

    return world;
}

World.CreateRandom = CreateRandom;

export default World;