/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import TileCanvas from "./TileCanvas";

//STUB START "Imports" for stub below
    import Component from "./Component";
    import Entity from "./Entity";
    import Action from "./Action";
    import World from "./World";

    import componentPosition from "./data/entity/components/position";

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

                const player = new Entity();
                const component = Component.FromSchema(componentPosition, 4, 7);
                player.position = component;            
                game.world.join(player, "player");

                for(let i = 0; i < 20; i++) {
                    const e = new Entity();
                    const comp = Component.FromSchema(componentPosition, Agency.Util.Dice.random(0, 29), Agency.Util.Dice.random(0, 29));
                    e.position = comp;

                    if(i === 0) {
                        game.world.join(e, "nemesis");
                    }
                    
                    game.world.join(e);
                }
                const nemesis = game.world.entities.nemesis;

                game.canvas = new TileCanvas(
                    600 / game.world.width,
                    600 / game.world.height,
                    { width: 600, height: 600, props: { fillStyle: "rgba(0, 0, 255, 0.3)", strokeStyle: "#000" }
                });

                const targets = [
                    player,
                    // nemesis,
                    // ...Game.$.world.entities.values.slice(2, 5)
                ];
                const _rangeVar = 10;
                setInterval(() => {
                    const entities = Game.$.world.entities.values;
                    
                    for(let target of targets) {
                        const circle = new Circle(
                            target.position.x,
                            target.position.y,
                            _rangeVar,
                        );
    
                        Action.Spawn(
                            target,
                            filterIntersection.IsEntityWithinCircle(circle, PointCircle.GetPerimeterPoints(circle)),
                            effectMove.Random(Game.$.canvas.cols, Game.$.canvas.rows),
                            target,
                        );
                        Action.Spawn(
                            target,
                            filterIntersection.IsEntityWithinCircle(circle, PointCircle.GetPerimeterPoints(circle)),
                            effectMove.CenterPoint(circle),
                            entities,
                        );
                    }
                }, 750);
                
                game.canvas.eraseFirst();
                game.canvas.onDraw = () => {
                    game.canvas.drawGrid();
                    

                    //STUB
                    for(let target of targets) {
                        game.canvas.save();
                        game.canvas.prop({ fillStyle: "rgba(0, 255, 255, 0.25)", strokeStyle: "rgba(0, 255, 255, 0.75)" }).tCircle(
                            target.position.x,
                            target.position.y,
                            _rangeVar,
                            { isFilled: true },
                        );
                        game.canvas.restore();
                    }


                    for(let ent of Game.$.world.entities.values) {
                        game.canvas.tRect(
                            ent.position.x,
                            ent.position.y,
                            1, 1, { isFilled: true }
                        );
                    }
                }
                game.loop.subject.start();
            //STUB END "World Dynamics"

            Game.Instance = game;
        }

        return Game.Instance;
    }
}