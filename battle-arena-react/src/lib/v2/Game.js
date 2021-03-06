/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import TileCanvas from "./util/render/TileCanvas";

//STUB START "Imports" for stub below
    import World from "./World";

    import componentPosition from "./data/entity/components/position";
    import componentTurn from "./data/entity/components/turn";
    import RenderGroup from "./manager/RenderGroup";
    import ImageRegistry from "./manager/ImageRegistry";

    import { ToCanvasMap } from "./data/image/tessellator/grid";
//STUB END "Imports"

export default class Game extends Agency.Beacon {
    constructor({ fps = 2 } = {}) {
        super(false);
        
        this.loop = Agency.Pulse.Generate(fps, { autostart: false });
        this.render = null;

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


                //TODO  This just raw dumps the file, but needs to be tessellated and sequenced, first
                // const renderGroup = new RenderGroup(
                //     game.world.entities,
                //     ImageRegistry.FromFiles([
                //         [ "./assets/images/skwrl.txt", "squirrel", 0, 0 ],
                //     ], { resolve: () => console.log(renderGroup.image("squirrel", 0, 0).toDataURL()) })
                // );

                Agency.Util.Base64.FileDecode("./assets/images/skwrl.txt")
                .then(canvas => ToCanvasMap(32, 32, canvas, { asTessellation: true }))
                .then(tessellation => {
                    tessellation.relative(30)
                        .add(`0.0`, 3)
                        .add(`1.0`, 6)
                        .add(`2.0`, 9)
                        .add(`3.0`, 12);
                        
                    game.SQUIRREL_IMAGE = tessellation.toSprite();
                });
                Agency.Util.Base64.FileDecode("./assets/images/bunny.txt")
                .then(canvas => ToCanvasMap(32, 32, canvas, { asTessellation: true }))
                .then(tessellation => {
                    tessellation.relative(30)
                        .add(`0.0`, 3)
                        .add(`1.0`, 6)
                        .add(`2.0`, 9)
                        .add(`3.0`, 12);
                        
                    game.BUNNY_IMAGE = tessellation.toSprite();
                });
                
                game.canvas.eraseFirst();
                game.canvas.onDraw = (dt, elapsed) => {
                    game.canvas.drawGrid();

                    for(let ent of game.world.entities.values) {
                        if(game.SQUIRREL_IMAGE && game.BUNNY_IMAGE) {
                            if(ent === player) {
                                game.canvas.image(
                                    game.SQUIRREL_IMAGE.get(elapsed),
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
                                    game.BUNNY_IMAGE.get(elapsed),
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