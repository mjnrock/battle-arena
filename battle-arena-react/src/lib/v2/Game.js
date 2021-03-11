import Agency from "@lespantsfancy/agency";

//STUB START "Imports" for stub below
    import World from "./World";

    import worldEntityLayer from "./data/render/world-entity-layer";
    import worldTerrainLayer from "./data/render/world-terrain-layer";
    import RenderManager from "./manager/RenderManager";
import findPath from "./util/AStar";
//STUB END "Imports"

export default class Game extends Agency.Beacon {
    // constructor({ fps = 24, GCD = 120 } = {}) {
    constructor({ fps = 24, GCD = 450 } = {}) {
        super(false);
        
        this.loop = Agency.Pulse.SubjectFactory(fps, { autostart: false });

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

            game.world = World.CreateRandom(20, 20, 10);

            // const frontier = [];
            // frontier.push([ [ 1, 1 ], 0 ]);
            // frontier.push([ [ 2, 1 ], 1 ]);
            // frontier.push([ [ 3, 1 ], 1 ]);
            // frontier.push([ [ 4, 1 ], 4 ]);
            // frontier.push([ [ 5, 1 ], 3 ]);
            // frontier.push([ [ 6, 1 ], 2 ]);
            // frontier.push([ [ 7, 1 ], 6 ]);
            // frontier.push([ [ 8, 1 ], 8 ]);
            // frontier.push([ [ 9, 1 ], 1 ]);
            // frontier.push([ [ 10, 1 ], 3 ]);
            // frontier.push([ [ 11, 1 ], 10 ]);
            // frontier.push([ [ 12, 1 ], 11 ]);
            // frontier.push([ [ 13, 1 ], 2 ]);
            // frontier.sort(([ ,a ], [ ,b ]) => b - a);

            // let frontier = [];
            // frontier.push(0);
            // frontier.push(1);
            // frontier.push(1);
            // frontier.push(4);
            // frontier.push(3);
            // frontier.push(2);
            // frontier.push(6);
            // frontier.push(8);
            // frontier.push(1);
            // frontier.push(3);
            // frontier.push(10);
            // frontier.push(11);
            // frontier.push(2);
            // frontier.sort((a, b) => b - a);

            // console.log(frontier)

            // STUB  Async testing
            setTimeout(() => {
                // const player = game.world.entities.player;
                // const nodes = game.world.range(
                //     player.position.x,
                //     player.position.y,
                //     2,
                //     2,
                //     { asGrid: true, centered: true }
                // );

                // game.loop.subject.stop()

                // console.log(nodes);

                //TODO  Move this somewhere more appropriate--currently requires async to compensate for mount times
                Agency.EventObservable.GetRef(game.render.canvas).on("next", (type, { data }) => {
                    const [ e ] = data;
                    const { target: canvas, buttons, clientX: x, clientY: y } = e;

                    if(type === "click") {
                        const { left, top } = canvas.getBoundingClientRect();
                        const pos = {
                            px: x - left,
                            py: y - top,
                        };
                        pos.tx = pos.px / 32;
                        pos.ty = pos.py / 32;
                        pos.txi = Math.floor(pos.tx);
                        pos.tyi = Math.floor(pos.ty);

                        console.info(pos.txi, pos.tyi, JSON.stringify([ ...game.world.node(pos.txi, pos.tyi) ].map(e => e.toData())));

                        const player = game.world.entities.player;
                        player.movement.destination = [ pos.txi, pos.tyi ];
                        player.movement.path = findPath(game.world, [ player.position.x, player.position.y ], player.movement.destination);
                    }
                });
            }, 500);

            //STUB  Testing cases for entities
            // for(let entity of game.world.entities.values) {
            //     console.log(entity.health.value.rate);
            // }

            //? Bootstrap the rendering
            game.render = new RenderManager(640, 640);
            worldTerrainLayer.init(game).then(group => game.render.addGroup(group));
            worldEntityLayer.init(game).then(group => game.render.addGroup(group));

            game.render.eraseFirst();
            game.render.onDraw = (dt, elapsed) => {
                game.render.drawLayers();
            };

            //? Perform an action whenever able
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

            Game.Instance = game;
        }

        return Game.Instance;
    }
}