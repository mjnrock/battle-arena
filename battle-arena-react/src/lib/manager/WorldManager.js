import Registry from "@lespantsfancy/agency/src/Registry";

export class WorldManager extends Registry {
    constructor(game, { worlds = [] } = {}) {
        super(worlds);

        this.__game = game;
    }

    get game() {
        return this.state.__game;
    }

    get current() {
        const player = this.game.players.player;
        
        if(player) {
            return this[ player.world.world ];
        }

        return this[ `overworld` ];
    }

    removeWorld(world) {
        if(this.has(world)) {
            this.unregister(world);
            world.__destroy(true);
        }

        return this;
    }
}

export default WorldManager;