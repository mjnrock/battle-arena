/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import RenderManager from "./manager/RenderManager";
import GameLoop from "./GameLoop";

import Lib from "./package";

import Entity from "./Entity";
import Ability from "./Ability";

import entitySchema from "./data/schemas/entity";
import { EnumSchemaTemplate as EnumPatternType } from "./data/schemas/patterns";
import ChannelManager from "./manager/ChannelManager";
import EntityManager from "./manager/EntityManager";

export default class Game extends Agency.Context {
    constructor({ fps = 24 } = {}) {
        super({
            loop: new GameLoop(fps),
            entities: new EntityManager(),
            canvas: new Lib.GridCanvas(25, 25, { width: 500, height: 500, props: { fillStyle: "rgba(0, 0, 255, 0.5)", strokeStyle: "#000" } }),
            channel: new ChannelManager(),
            render: new RenderManager(),
        });

        //? ====    LOGIC   ====
            const player = this.entities.create(entitySchema, {
                position: [ 3, 3 ],
                abilities: [
                    new Ability({ pattern: EnumPatternType.SELF(true) }),
                    new Ability({ pattern: EnumPatternType.UP(true) }),
                    new Ability({ pattern: EnumPatternType.UP2(true) }),
                    new Ability({ pattern: EnumPatternType.SURROUND(true) }),
                    new Ability({ pattern: EnumPatternType.SURROUND_PLUS(true) }),
                ]
            }, "player");

            this.entities.spawn(5, entitySchema);
        // //? ====    /LOGIC   ====


        this.channel.addGame(this);
        this.render.addGame(this);


        // Create Singleton pattern
        if(!Game.Instance) {
            Game.Instance = this;
        }
    }
    
    abilities(key) {
        if(!this.entities.player.components.abilities.all[ key ]) {
            return;
        }

        const points = this.entities.player.components.abilities.all[ key ].points(this.entities.player.components.position.x, this.entities.player.components.position.y);
        for(let [ x, y, effect ] of points) {
            const entity = Entity.FromSchema(entitySchema, {
                position: [ x, y ],
                condition: [ "ATTACKING" ],
            });
            this.entities.register(entity);
        }
    }

    // Access Singleton pattern via Game.$
    static get $() {
        if(!Game.Instance) {
            Game.Instance = new Game();
            
            Game.$.canvas._config.clearBeforeDraw = true;
            Game.$.loop.start();
        }

        return Game.Instance;
    }
}