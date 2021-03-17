import Agency from "@lespantsfancy/agency";

//STUB START "Imports" for stub below
    import World from "./World";
    import RenderLayer from "./util/render/RenderLayer";
    import RenderManager from "./manager/RenderManager";
    import findPath from "./util/AStar";

    import initImageRepository from "./data/render/repository";
    import { loadEntity, loadTerrain } from "./data/render/entity";

    import { drawLayer as createEntityLayer, comparator as entityLayerComparator } from "./data/render/world-entity-layer";
    import { drawLayer as createTerrainLayer, comparator as terrainLayerComparator } from "./data/render/world-terrain-layer";
import RenderGroup from "./util/render/RenderGroup";
//STUB END "Imports"

export default class Game extends Agency.Beacon {
    // constructor({ fps = 24, GCD = 500 } = {}) {
    constructor({ fps = 24, GCD = 1500 } = {}) {
        super(false);
        
        this.loop = Agency.Pulse.SubjectFactory(fps, { autostart: false });

        this.config = {
            GCD,
            SHOW_UI: true,
            MOUSE_POSITION: [ 10, 10 ],
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
            Game.Instance = new Game();
            const game = Game.Instance;

            game.world = World.CreateRandom(35, 35, 25);

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

                    const { left, top } = canvas.getBoundingClientRect();
                    const pos = {
                        px: x - left,
                        py: y - top,
                    };
                    pos.tx = pos.px / 32;
                    pos.ty = pos.py / 32;
                    pos.txi = Math.floor(pos.tx);
                    pos.tyi = Math.floor(pos.ty);

                    if(type === "click") {
                        // console.info(pos.txi, pos.tyi, JSON.stringify(game.world.getTerrain(pos.txi, pos.tyi).terrain.toData()));
                        console.info(pos.txi, pos.tyi, game.world.node(pos.txi, pos.tyi));

                        const player = game.world.entities.player;
                        player.movement.destination = [ pos.txi, pos.tyi ];
                        player.movement.path = findPath(game.world, [ player.position.x, player.position.y ], player.movement.destination);
                    } else if(type === "mousemove") {
                        game.config.MOUSE_POSITION = [ pos.txi, pos.tyi ];
                    }
                });

                // game.config.SHOW_UI = true;
                window.onkeypress = e => {
                    e.preventDefault();

                    if(e.key === "v") {
                        game.config.SHOW_UI = !game.config.SHOW_UI;
                    }
                }
            }, 500);

            //STUB  Testing cases for entities
            // for(let entity of game.world.entities.values) {
            //     console.log(entity.health.value.rate);
            // }


            //? Bootstrap the rendering
            game.render = new RenderManager(game.world.width * 32, game.world.height * 32, { repository: initImageRepository() });
            (async () => {
                //  Load Images
                await game.render.loadImages(game, loadEntity);
                await game.render.loadImages(game, loadTerrain);

                game.render.addLayer(new RenderLayer(game.world.terrain, { painter: createTerrainLayer, comparator: terrainLayerComparator, config: { clearBeforeDraw: false } }));
                game.render.addLayer(new RenderLayer(game.world.entities, { painter: createEntityLayer, comparator: entityLayerComparator, config: { clearBeforeDraw: true } }));
                game.render.addLayer(new RenderLayer([], { config: { clearBeforeDraw: true } }));
    
                game.render.eraseFirst();
                game.render.onDraw = (dt, elapsed) => {
                    game.render.drawLayers();
                };
            
                game.render.getLayer(2).addHook(function(dt, elapsed) {
                    if(game.config.SHOW_UI) {
                        this.save();
                            let mouse = {
                                tx: ((this.game.config.MOUSE_POSITION || [])[ 0 ] || 0),
                                ty: ((this.game.config.MOUSE_POSITION || [])[ 1 ] || 0),
                            };
                            mouse.x = mouse.tx * this.tw;
                            mouse.y = mouse.ty * this.th;

                            this.ctx.strokeStyle = `rgba(180, 180, 180, 0.25)`;
                            let r = 5;
                            for(let dx = -r; dx <= r; dx++) {
                                for(let dy = -r; dy <= r; dy++) {
                                    this.tRect(
                                        mouse.tx + dx,
                                        mouse.ty + dy,
                                        1,
                                        1,
                                        { isFilled: false },
                                    );
                                }
                            }

                            this.ctx.strokeStyle = `rgba(210, 210, 210, 0.25)`;
                            this.prop({ lineWidth: 5 }).tRect(
                                mouse.tx,
                                mouse.ty,
                                1,
                                1,
                                { isFilled: false },
                            );

                            let feather = 32,
                                radius = 128;

                            this.ctx.globalCompositeOperation = "destination-in";
                            this.ctx.filter = `blur(${ feather }px)`;  // "feather"

                            this.ctx.beginPath();
                            this.ctx.arc(mouse.x + this.tw / 2, mouse.y + this.th / 2, radius, 0, 2 * Math.PI);
                            this.ctx.fill();

                            this.ctx.globalCompositeOperation = "destination-out";
                            this.ctx.filter = "none";

                        this.restore();
                    }
                });
                game.render.getLayer(2).addHook(function(dt, elapsed) {
                    if(game.config.SHOW_UI) {
                        this.save();
                        const player = game.world.entities.player;
                        const path = player.movement.path || [];
                        const [ x, y ] = player.movement.destination || [];

                        for(let [ tx, ty ] of path) {
                            this.prop({ fillStyle: `rgba(0, 0, 255, 0.15)` }).tRect(
                                tx,
                                ty,
                                1,
                                1,
                                { isFilled: true },
                            );
                        }
                        
                        if(!(player.position.x === x && player.position.y === y)) {
                            this.prop({ fillStyle: `rgba(0, 0, 255, 0.15)` }).tRect(
                                x,
                                y,
                                1,
                                1,
                                { isFilled: true },
                            );
                        }
                        this.restore();
                    }
                });
            })();

            //? Perform an action whenever able
            game.on("next", (type, { dt, now }) => {
                if(type === "tick") {
                    const now = Date.now();
                    for(let entity of game.world.entities.values) {
                        if(now - entity.turn.timeout >= game.config.GCD) {
                            entity.turn.current(entity);
                            entity.turn.timeout = now;
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