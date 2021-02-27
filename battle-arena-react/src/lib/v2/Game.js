/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import TileCanvas from "./TileCanvas";

//STUB START "Imports" for stub below
    import Component from "./Component";
    import Entity from "./Entity";
    import Action from "./Action";
    import World from "./World";

    import componentPosition from "./data/entity/components/position";

    import filterProximity from "./data/entity/filters/proximity";
    import effectMove from "./data/entity/effects/move";
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
                game.world = new World(25, 25);

                const entity = new Entity();
                const component = Component.FromSchema(componentPosition, 4, 7);
                entity.position = component;            
                game.world.join(entity, "player");

                const e2 = new Entity();
                const c2 = Component.FromSchema(componentPosition, 4, 7);
                e2.position = c2;            
                game.world.join(e2);

                game.canvas = new TileCanvas(
                    600 / game.world.width,
                    600 / game.world.height,
                    { width: 600, height: 600, props: { fillStyle: "rgba(0, 0, 255, 1.0)", strokeStyle: "#000" }
                });

                setInterval(() => {
                    const entities = Game.$.world.entities.values;

                    Action.Spawn(
                        entity,
                        filterProximity.Range(entity.position.x, entity.position.y, 0),
                        effectMove.Random(Game.$.canvas.cols, Game.$.canvas.rows),
                        entities,
                    );
                }, 750);
                
                game.canvas.eraseFirst();
                game.canvas.onDraw = () => {
                    game.canvas.drawGrid();

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