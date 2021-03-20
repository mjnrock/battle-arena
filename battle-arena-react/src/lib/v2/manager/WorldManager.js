import { v4 as uuidv4, validate } from "uuid";
import Agency from "@lespantsfancy/agency";

import Registry from "./../util/Registry";
import { hasPosition } from "../data/entity/components/position";
import World from "../World";

export class WorldManager {
    constructor(game) {
        this.__id = uuidv4();
        this.__game = game;

        this.worlds = new Registry();
    }

    add(world, ...synonyms) {
        this.worlds.register(world, ...synonyms);

        return this;
    }
    remove(world, ...synonyms) {
        this.worlds.unregister(world, ...synonyms);

        return this;
    }
    get(id) {
        return this.worlds[ id ];
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
                return this.worlds[ player.position.world ];
            }
        }

        return this.worlds[ `overworld` ];
    }

    migrate(entity, world) {
        if(!hasPosition(entity)) {
            return false;
        }

        const oldWorld = this[ entity.position.world ];
        if(oldWorld instanceof World) {
            oldWorld.leave(entity);
        }        
        
        if(world instanceof World) {
            this.worlds[ world.id ].join(entity);
        } else {
            this.worlds[ world ].join(entity);
        }

        return this;
    }
}

export default WorldManager;