/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import TileCanvas from "./util/render/TileCanvas";

//STUB START "Imports" for stub below
    import World from "./World";

    import componentPosition from "./data/entity/components/position";
    import componentTurn from "./data/entity/components/turn";
//STUB END "Imports"

export default class Game extends Agency.Beacon {
    constructor({ fps = 2 } = {}) {
        super(false);
        
        this.loop = Agency.Pulse.Generate(fps, { autostart: false });
        this.render = null;

        let img = new Image();
        img.src = "./assets/images/squirrel.png";
        img.onload = e => {
            this.SQUIRREL_IMAGE = img;
        };
        let img2 = new Image();
        img2.src = "./assets/images/bunny.png";
        img2.onload = e => {
            this.BUNNY_IMAGE = img2;
        };

        // Create Singleton pattern
        if(!Game.Instance) {
            Game.Instance = this;
        }
        
        this.attach(this.loop);
    }

    // Access Singleton pattern via Game.$
    static get $() {
        if(!Game.Instance) {
            const game = new Game();

            //STUB START "World Dynamics"
                game.world = new World(20, 20);
                game.canvas = new TileCanvas(
                    640 / game.world.width,
                    640 / game.world.height,
                    { width: 640, height: 640, props: { fillStyle: "rgba(0, 0, 255, 0.3)", strokeStyle: "#000" }
                });

                game.world.entities.create([
                    [ componentPosition, { x: 4, y: 7 } ],
                    [ componentTurn, { timeoutStart: () => Agency.Util.Dice.random(0, 2499) } ],
                ], "player");
                const player = game.world.entities.player;

                game.world.entities.createMany(10, [
                    [ componentPosition, { x: () => Agency.Util.Dice.random(0, game.world.width - 1), y: () => Agency.Util.Dice.random(0, game.world.height - 1) } ],
                    [ componentTurn, { timeoutStart: () => Agency.Util.Dice.random(0, 2499) } ],
                ]);     // ], (i) => `enemy-${ i }`);
                
                game.canvas.eraseFirst();
                game.canvas.onDraw = (dt) => {
                    game.canvas.drawGrid();

                    for(let ent of game.world.entities.values) {
                        if(game.SQUIRREL_IMAGE && game.BUNNY_IMAGE) {
                            if(ent === player) {
                                game.canvas.image(
                                    game.SQUIRREL_IMAGE,
                                    0,
                                    0,
                                    game.canvas.tw,
                                    game.canvas.th,
                                    ent.position.x * game.canvas.tw,
                                    ent.position.y * game.canvas.th,
                                    game.canvas.tw,
                                    game.canvas.th,
                                );
                            } else {
                                game.canvas.image(
                                    game.BUNNY_IMAGE,
                                    0,
                                    0,
                                    game.canvas.tw,
                                    game.canvas.th,
                                    ent.position.x * game.canvas.tw,
                                    ent.position.y * game.canvas.th,
                                    game.canvas.tw,
                                    game.canvas.th,
                                );
                            }
                        } else {
                            game.canvas.save();
                            game.canvas.prop({ fillStyle: ent === player ? "rgba(0, 150, 100, 0.3)" : "rgba(0, 0, 255, 0.3)"}).tRect(
                                ent.position.x,
                                ent.position.y,
                                1, 1, { isFilled: true }
                            );
                            game.canvas.restore();
                        }
                        
                        //ANCHOR    "Turn Timer"
                        const GCD = 5000;
                        let prog = ((Date.now() - ent.turn.timeoutStart) % GCD) / GCD;      // % GCD hides information and should only be used for testing
                        // let prog = (Date.now() - ent.turn.timeoutStart) / GCD;
                        let color = `rgba(95, 160, 80, 0.75)`;
                        if(prog >= 0.80) {
                            color = `rgba(196, 74, 74, 0.75)`;
                        } else if(prog >= 0.55) {
                            color = `rgba(201, 199, 72, 0.75)`;
                        }
                        game.canvas.save();
                            game.canvas.prop({ fillStyle: `rgba(0, 0, 0, 0.15)`, strokeStyle: "transparent" }).circle(
                                ent.position.x * game.canvas.tw + game.canvas.tw / 2,
                                ent.position.y * game.canvas.th - game.canvas.tw / 2,
                                8,
                                { isFilled: true },
                            );
                        game.canvas.restore();
                        game.canvas.save();
                            game.canvas.prop({ fillStyle: color, strokeStyle: `rgba(0, 0, 0, 0.35)` }).pie(
                                ent.position.x * game.canvas.tw + game.canvas.tw / 2,
                                ent.position.y * game.canvas.th - game.canvas.tw / 2,
                                7,
                                0,
                                prog * Math.PI * 2,
                                { isFilled: true, counterClockwise: true },
                            );
                        game.canvas.restore();
                    }
                }
                game.loop.subject.start();
            //STUB END "World Dynamics"

            Game.Instance = game;
        }

        return Game.Instance;
    }
}