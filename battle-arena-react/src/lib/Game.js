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
            this.entities.register(player, "player");

            // const ob = new Agency.Observer(player.components, console.log);

            window.onkeydown = e => {
                if(e.which === 68 || e.which === 39) {
                    ++player.components.position.x;
                } else if(e.which === 65 || e.which === 37) {
                    --player.components.position.x;
                } else if(e.which === 87 || e.which === 38) {
                    --player.components.position.y;
                } else if(e.which === 83 || e.which === 40) {
                    ++player.components.position.y;
                }
            };
        // //? ====    /LOGIC   ====


        // //! ====    RENDER   ====
            console.log(this.canvas)
            this.canvas.onDraw = (cvs) => {
                cvs.drawGrid();

                const { x, y } = player.components.position;
                cvs.gRect(x, y, 1, 1, { isFilled: true });
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