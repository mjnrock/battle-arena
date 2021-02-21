/* eslint-disable */
import Agency from "@lespantsfancy/agency";
import Entity from "./Entity";
import GameLoop from "./GameLoop";

import Lib from "./package";

import entitySchema from "./data/schemas/entity";
import Ability from "./Ability";

export default class Game extends Agency.Context {
    constructor({ fps = 24 } = {}) {
        super({
            loop: new GameLoop(fps),
            entities: new Agency.Registry(),
            canvas: new Lib.GridCanvas(25, 25, { width: 500, height: 500, props: { fillStyle: "rgba(0, 0, 255, 0.5)", strokeStyle: "#000" } })
        });


        //? ====    LOGIC   ====
            const player = Entity.FromSchema(entitySchema, {
                position: [ 3, 3 ],
                abilities: [
                    new Ability({ pattern: [
                        [ 0, -1, true ],
                    ]}),
                    new Ability({ pattern: [
                        [ 0, -1, true ],
                        [ 0, -2, true ],
                    ]}),
                    new Ability({ pattern: [
                        [ 0, -1, true ],
                        [ -1, 0, true ],
                        [ 1, 0, true ],
                        [ 0, 1, true ],
                    ]}),
                    new Ability({ pattern: [
                        [ 0, -1, true ],
                        [ -1, 0, true ],
                        [ 1, 0, true ],
                        [ 0, 1, true ],

                        [ 2, 2, true ],
                        [ 2, -2, true ],
                        [ -2, 2, true ],
                        [ -2, -2, true ],
                    ]})
                ]
            });
            this.entities.register(player, "player");

            for(let i = 0; i < 5; i++) {
                const entity = Entity.FromSchema(entitySchema);
                this.entities.register(entity);
            }


            function abilities(key) {
                const points = player.components.abilities.all[ key ].points(player.components.position.x, player.components.position.y);
                for(let [ x, y, effect ] of points) {
                    const entity = Entity.FromSchema(entitySchema, {
                        position: [ x, y ],
                        condition: [ "ATTACKING" ],
                    });
                    Game.$.entities.register(entity);
                }
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
                } else if(e.which === 32) {
                    player.components.condition.current = "ATTACKING";

                    abilities(0);
                } else if(e.which >= 49 && e.which <= 51) {
                    player.components.condition.current = "ATTACKING";

                    abilities(e.which - 48);
                }
            };
            window.onkeyup = e => {
                player.components.condition.current = "IDLE";
            };


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
                        cvs.prop({ fillStyle: `rgba(${ Agency.Util.Dice.random(0, 255) }, ${ Agency.Util.Dice.random(0, 255) }, ${ Agency.Util.Dice.random(0, 255) }, 0.5)` });
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