/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import TileCanvas from "./TileCanvas";

//STUB START "Imports" for stub below
    import Component from "./Component";
    import Entity from "./Entity";
    import Action from "./Action";
    import World from "./World";

    import componentPosition from "./data/entity/components/position";
    import componentTask from "./data/entity/components/task";

    import filterIntersection from "./data/entity/filters/intersection";
    import effectMove from "./data/entity/effects/move";

    import Rectangle from "./util/Rectangle";
    import Circle from "./util/Circle";
    import PointCircle from "./util/PointCircle";
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
                game.world = new World(30, 30);
                game.canvas = new TileCanvas(
                    600 / game.world.width,
                    600 / game.world.height,
                    { width: 600, height: 600, props: { fillStyle: "rgba(0, 0, 255, 0.3)", strokeStyle: "#000" }
                });

                const player = new Entity();
                const compPosition = Component.FromSchema(componentPosition, 4, 7);
                player.position = compPosition;
                const compTask = Component.FromSchema(componentTask);
                player.task = compTask;
                game.world.join(player, "player");

                for(let i = 0; i < 10; i++) {
                    const e = new Entity();
                    const comp = Component.FromSchema(componentPosition, Agency.Util.Dice.random(0, 29), Agency.Util.Dice.random(0, 29));
                    e.position = comp;
                    const compTask = Component.FromSchema(componentTask);
                    e.task = compTask;
                    game.world.join(e);
                }
                
                game.canvas.eraseFirst();
                game.canvas.onDraw = (dt) => {
                    game.canvas.drawGrid();

                    for(let ent of Game.$.world.entities.values) {
                        game.canvas.save();
                        game.canvas.prop({ fillStyle: ent === player ? "rgba(0, 150, 100, 0.3)" : "rgba(0, 0, 255, 0.3)"}).tRect(
                            ent.position.x,
                            ent.position.y,
                            1, 1, { isFilled: true }
                        );
                        game.canvas.restore();
                        
                        const GCD = 2500;
                        let prog = (Date.now() - ent.task.timeoutStart) / GCD;
                        if(prog > 2) {
                            console.warn(`ERROR`, ent)
                            ent.offTurn();
                            ent.onTurn();
                        }
                        let color = `rgba(95, 160, 80, 0.75)`;
                        if(prog >= 0.75) {
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