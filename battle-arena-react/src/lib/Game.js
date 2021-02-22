/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import RenderManager from "./manager/RenderManager";
import GameLoop from "./GameLoop";

import Lib from "./package";

import ChannelManager from "./manager/ChannelManager";
import EntityManager from "./manager/EntityManager";

import Entity from "./Entity";

import entityEffectSchema from "./data/schemas/entity-effect";

export default class Game extends Agency.Context {
    constructor({ fps = 24 } = {}) {
        super({
            loop: new GameLoop(fps),
            entities: new EntityManager(),
            canvas: new Lib.GridCanvas(25, 25, { width: 500, height: 500, props: { fillStyle: "rgba(0, 0, 255, 0.5)", strokeStyle: "#000" } }),
            channel: new ChannelManager(),
            render: new RenderManager(),
        });

        
        this.channel.addGame(this);
        this.render.addGame(this);
        this.entities.addGame(this);


        // Create Singleton pattern
        if(!Game.Instance) {
            Game.Instance = this;
        }
    }
    
    useAbility(key) {
        if(!this.entities.player.components.abilities.all[ key ]) {
            return;
        }

        const points = this.entities.player.components.abilities.all[ key ].perform(this.entities.player.components.position.x, this.entities.player.components.position.y);
        for(let [ x, y, effect, magnitudeFn ] of points) {
            const entity = Entity.FromSchema(entityEffectSchema, {
                position: [ x, y ],
                condition: [ effect.type === 1 ? "ATTACKING" : "IDLE" ],
            });
            this.entities.register(entity);

            for(let e of this.entities.values) {
                if(e.components.type.current !== "EFFECT" && e.components.position.x === x && e.components.position.y === y) {
                    if(typeof magnitudeFn === "function") {
                        effect.affect(e, magnitudeFn(e, this.entities.player));       // Dynamically calculate magnitude based on target and/or source entity
                    } else if(!Number.isNaN(+magnitudeFn)) {
                        effect.affect(e, +magnitudeFn);     // Numerically declare magnitude
                    } else {
                        effect.affect(e);   // Magnitude not relevant to this effect (e.g. kill, teleport, etc.);
                    }
                }
            }
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