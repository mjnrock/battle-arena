import { v4 as uuidv4 } from "uuid";
import Agency from "@lespantsfancy/agency";

import Registry from "./../util/Registry";

import World from "../World";
import { hasPosition } from "../data/entity/components/position";

export class WorldManager {
    constructor(game, { repository } = {}) {
        this.__id = uuidv4();
        this.__game = game;

        this.repository = repository || new Registry();
    }

    add(world, ...synonyms) {
        this.repository.register(world, ...synonyms);

        return this;
    }
    remove(world) {
        this.repository.unregister(world);

        return this;
    }
    get(id) {
        return this.repository[ id ];
    }

    get id() {
        return this.__id;
    }
    get game() {
        return this.__game;
    }

    get current() {
        if(this.game) {
            const player = this.game.players.player;
            
            if(player) {
                return this.repository[ player.position.world ];
            }
        }

        return this.repository[ `overworld` ];
    }

    migrate(entity, world, x, y) {
        if(!hasPosition(entity)) {
            return false;
        }

        const oldWorld = this[ entity.position.world ];
        if(oldWorld instanceof World) {
            oldWorld.leave(entity);
        }        
        
        if(world instanceof World) {
            this.repository[ world.id ].join(entity);
        } else {
            this.repository[ world ].join(entity);
        }

        if(x !== void 0 && y !== void 0) {
            entity.position.x = x;
            entity.position.y = y;
        }

        return this;
    }
}

export default WorldManager;