/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import TileCanvas from "./util/render/TileCanvas";

//STUB START "Imports" for stub below
    import World from "./World";

    import componentPosition from "./data/entity/components/position";
    import componentTurn from "./data/entity/components/turn";
    import componentTerrain, { DictTerrain } from "./data/entity/components/terrain";

    import worldEntityLayer from "./data/render/world-entity-layer";
    import worldTerrainLayer from "./data/render/world-terrain-layer";
    import RenderManager from "./manager/RenderManager";
//STUB END "Imports"

export default class Game extends Agency.Beacon {
    constructor({ fps = 24, GCD = 1500 } = {}) {
        super(false);
        
        this.loop = Agency.Pulse.Generate(fps, { autostart: false });
        this.render = null;

        this.config = {
            GCD,
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

                for(let x = 0; x < game.world.width; x++) {
                    for(let y = 0; y < game.world.height; y++) {
                        game.world.terrain.create([
                            [ componentTerrain, Math.random() <= 0.75 ? DictTerrain.GRASS : DictTerrain.WATER ],
                            [ componentPosition, { x, y, facing: 0 } ],
                            [ componentTurn, { timeoutStart: 0 } ],
                        ], `${ x }.${ y }`);
                    }
                }
                // console.log(game.world.terrain[ "3.4" ]);


                game.world.entities.create([
                    [ componentPosition, { x: 4, y: 7 } ],
                    [ componentTurn, { timeoutStart: () => Agency.Util.Dice.random(0, 2499) } ],
                ], "player");

                game.world.entities.createMany(10, [
                    [ componentPosition, { x: () => Agency.Util.Dice.random(0, game.world.width - 1), y: () => Agency.Util.Dice.random(0, game.world.height - 1), facing: () => Agency.Util.Dice.random(0, 3) * 90 } ],
                    [ componentTurn, { timeoutStart: () => Date.now() - Agency.Util.Dice.random(0, 1499) } ],
                ], (i) => `enemy-${ i }`);



                game.canvas = new RenderManager(640, 640);
                worldTerrainLayer.init(game).then(group => game.canvas.addGroup(group));
                worldEntityLayer.init(game).then(group => game.canvas.addGroup(group));

                game.canvas.eraseFirst();
                game.canvas.onDraw = (dt, elapsed) => {
                    game.canvas.drawLayers();
                };



                game.on("next", (type, { dt, now }) => {
                    if(type === "tick") {
                        const now = Date.now();
                        for(let entity of game.world.entities.values) {
                            if(now - entity.turn.timeoutStart >= game.config.GCD) {
                                entity.turn.current(entity);
                                entity.turn.timeoutStart = now;
                            }
                        }
                    }
                });

                game.loop.subject.start();
            //STUB END "World Dynamics"

            Game.Instance = game;
        }

        return Game.Instance;
    }
}