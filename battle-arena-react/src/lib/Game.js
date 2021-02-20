/* eslint-disable */
import Agency from "@lespantsfancy/agency";
import Component from "./Component";
import Entity from "./Entity";
import GameLoop from "./GameLoop";

import Lib from "./package";

export default class Game extends Agency.Context {
    constructor({ fps = 24 } = {}) {
        super({
            loop: new GameLoop(fps),
            entities: new Agency.Registry(),
            canvas: new Lib.GridCanvas(25, 25, { width: 500, height: 500, props: { fillStyle: "rgba(0, 0, 255, 0.5)", strokeStyle: "#000" } })
        });


        //? ====    LOGIC   ====
            const player = new Entity();
            player.gain(new Component("position", {
                x: 3,
                y: 5,
            }));
            player.gain(new Component("attributes", {
                ATK: 2,
                DEF: 1,
                HP: {
                    current: 10,
                    max: 10,
                },
                XP: {
                    current: 0,
                    max: 100,
                    level: 1,
                },
            }));
            player.gain(new Component("condition", {
                current: "IDLE",
            }));
            this.entities.register(player, "player");

            for(let i = 0; i < 2; i++) {                
                const entity = new Entity();
                entity.gain(new Component("position", {
                    x: Agency.Util.Dice.d25(1, -1),
                    y: Agency.Util.Dice.d25(1, -1),
                }));
                entity.gain(new Component("attributes", {
                    ATK: 2,
                    DEF: 1,
                    HP: {
                        current: 10,
                        max: 10,
                    },
                    XP: {
                        current: 0,
                        max: 100,
                        level: 1,
                    },
                }));
                entity.gain(new Component("condition", {
                    current: "IDLE",
                }));

                this.entities.register(entity);
            }



            window.onkeydown = e => {
                if(e.which === 68 || e.which === 39) {
                    ++player.components.position.x;

                    player.components.condition.current = "RUNNING";
                } else if(e.which === 65 || e.which === 37) {
                    --player.components.position.x;

                    player.components.condition.current = "RUNNING";
                } else if(e.which === 87 || e.which === 38) {
                    --player.components.position.y;

                    player.components.condition.current = "RUNNING";
                } else if(e.which === 83 || e.which === 40) {
                    ++player.components.position.y;

                    player.components.condition.current = "RUNNING";
                }
            };
            window.onkeyup = e => {
                player.components.condition.current = "IDLE";
            };



            // this.selections = new Map();
            // this.on("input", (type, buttons, { txi, tyi } = {}) => {
            //     if(buttons === 2) {
            //         this.selections = [];
            //     } else if(buttons === 1 && type === "mousemove") {
            //         this.selections.set(`${ txi }.${ tyi }`, [ buttons, txi, tyi ]);
            //     } else if(type === "click") {
            //         this.selections.set(`${ txi }.${ tyi }`, [ buttons, txi, tyi ]);
            //     }
            // });

            // const obs = new Agency.Observer(this, () => {
            //     this.selections.delete(`${ player.components.position.x }.${ player.components.position.y }`);
            // });



            const ob = new Agency.Observer(player.components.condition, (state, [,,condition ]) => {
                if(condition === "IDLE") {
                    Game.$.canvas.prop({ fillStyle: "rgba(0, 0, 255, 0.5)" });
                } else if(condition === "RUNNING") {
                    Game.$.canvas.prop({ fillStyle: "rgba(255, 0, 255, 0.5)" });
                }
            });
        // //? ====    /LOGIC   ====


        // //! ====    RENDER   ====
            console.log(this.canvas)
            this.canvas.onDraw = (cvs) => {
                cvs.drawGrid();

                // this.selections.forEach(([ buttons, x, y ]) => {
                //     cvs.save().prop({ fillStyle: "rgba(150, 255, 150, 0.5)" }).gRect(x, y, 1, 1, { isFilled: true }).restore();
                // });
                this.entities.values.forEach(entity => {
                    const { x, y } = entity.components.position;
                    cvs.save().prop({ fillStyle: entity === this.entities.player ? "rgba(150, 255, 150, 0.5)" : "rgba(255, 150, 150, 0.5)" }).gRect(x, y, 1, 1, { isFilled: true }).restore();
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