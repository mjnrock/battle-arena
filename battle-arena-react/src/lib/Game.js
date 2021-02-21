/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import KeyManager from "./KeyManager";
import MouseManager from "./MouseManager";
import GameLoop from "./GameLoop";

import Lib from "./package";

import Entity from "./Entity";
import Ability from "./Ability";

import entitySchema from "./data/schemas/entity";
import { EnumSchemaTemplate as EnumPatternType } from "./data/schemas/patterns";

export default class Game extends Agency.Context {
    constructor({ fps = 24 } = {}) {
        super({
            loop: new GameLoop(fps),
            entities: new Agency.Registry(),
            canvas: new Lib.GridCanvas(25, 25, { width: 500, height: 500, props: { fillStyle: "rgba(0, 0, 255, 0.5)", strokeStyle: "#000" } }),
            station: new Agency.Channel(),
        });

        this._state.station.subscribe((ctx, type, ...args) => {
            if(type === "input") {
                const [ eventType ] = args;

                if(eventType === "keyup") {
                    this.entities.player.components.condition.current = "IDLE";
                } else if(eventType === "keydown") {
                    const which = args[ 1 ];

                    if(which === 68 || which === 39) {
                        ++this.entities.player.components.position.x;
    
                        this.entities.player.components.condition.current = "RUNNING";
                    } else if(which === 65 || which === 37) {
                        --this.entities.player.components.position.x;
    
                        this.entities.player.components.condition.current = "RUNNING";
                    } else if(which === 87 || which === 38) {
                        --this.entities.player.components.position.y;
    
                        this.entities.player.components.condition.current = "RUNNING";
                    } else if(which === 83 || which === 40) {
                        ++this.entities.player.components.position.y;
    
                        this.entities.player.components.condition.current = "RUNNING";
                    } else if(which === 32) {
                        this.entities.player.components.condition.current = "ATTACKING";
    
                        abilities(0);
                    } else if(which >= 49 && which <= 57) {
                        this.entities.player.components.condition.current = "ATTACKING";
    
                        abilities(which - 48);
                    }
                }
            }
        });
        this._state.station.watch("input", KeyManager.$);
        this._state.station.watch("input", MouseManager.$);

        //? ====    LOGIC   ====
            const player = Entity.FromSchema(entitySchema, {
                position: [ 3, 3 ],
                abilities: [
                    new Ability({ pattern: EnumPatternType.SELF(true) }),
                    new Ability({ pattern: EnumPatternType.UP(true) }),
                    new Ability({ pattern: EnumPatternType.UP2(true) }),
                    new Ability({ pattern: EnumPatternType.SURROUND(true) }),
                    new Ability({ pattern: EnumPatternType.SURROUND_PLUS(true) }),
                ]
            });
            this.entities.register(player, "player");

            for(let i = 0; i < 5; i++) {
                const entity = Entity.FromSchema(entitySchema);
                this.entities.register(entity);
            }


            function abilities(key) {
                if(!player.components.abilities.all[ key ]) {
                    return;
                }

                const points = player.components.abilities.all[ key ].points(player.components.position.x, player.components.position.y);
                for(let [ x, y, effect ] of points) {
                    const entity = Entity.FromSchema(entitySchema, {
                        position: [ x, y ],
                        condition: [ "ATTACKING" ],
                    });
                    Game.$.entities.register(entity);
                }
            }


            // const ob = new Agency.Observer(player.components.condition, (state, [,,condition ]) => {
            //     if(condition === "IDLE") {
            //         Game.$.canvas.prop({ fillStyle: "rgba(0, 0, 255, 0.5)" });
            //     } else if(condition === "RUNNING") {
            //         Game.$.canvas.prop({ fillStyle: "rgba(255, 0, 255, 0.5)" });
            //     } else if(condition === "ATTACKING") {
            //         Game.$.canvas.prop({ fillStyle: "rgba(255, 0, 0, 0.5)" });
            //     }
            // });
        // //? ====    /LOGIC   ====


        // //! ====    RENDER   ====
            console.log(this.canvas)
            this.canvas.onDraw = (cvs) => {
                cvs.drawGrid();

                this.entities.values.forEach(entity => {
                    const { x, y } = entity.components.position;
                    const condition = entity.components.condition.current;

                    cvs.save();
                    if(condition === "IDLE") {
                        cvs.prop({ fillStyle: "rgba(0, 0, 255, 0.5)" });
                    } else if(condition === "RUNNING") {
                        cvs.prop({ fillStyle: "rgba(255, 0, 255, 0.5)" });
                    } else if(condition === "ATTACKING") {
                        cvs.prop({ fillStyle: `rgba(${ Agency.Util.Dice.random(0, 255) }, ${ Agency.Util.Dice.roll(0, 255) }, ${ Agency.Util.Dice.roll(0, 255) }, 0.5)` });
                    }
                    cvs.gRect(x, y, 1, 1, { isFilled: true });
                    cvs.restore();
                });
            };
        //! ====    /RENDER   ====





        // Create Singleton pattern
        if(!Game.Instance) {
            Game.Instance = this;
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