import Agency from "@lespantsfancy/agency";

import Watcher from "./util/Watcher";
import Pulse from "./util/Pulse";

//STUB START "Imports" for stub below
    import World from "./World";
    import RenderLayer from "./util/render/RenderLayer";
    import RenderManager from "./manager/RenderManager";
    import findPath from "./util/AStar";

    import initImageRepository from "./data/render/repository";
    import { loadEntity, loadTerrain } from "./data/render/entity";

    import { drawLayer as createEntityLayer, comparator as entityLayerComparator } from "./data/render/world-entity-layer";
    import { drawLayer as createTerrainLayer, comparator as terrainLayerComparator } from "./data/render/world-terrain-layer";
    
    import componentMeta, { EnumEntityType } from "./data/entity/components/meta";
    import componentPosition from "./data/entity/components/position";
    import componentTurn from "./data/entity/components/turn";
    import componentHealth from "./data/entity/components/health";
    import componentAction from "./data/entity/components/movement";
import RenderGroup from "./util/render/RenderGroup";
import WorldManager from "./manager/WorldManager";
import Arena from "./Arena";
import PlayerManager from "./manager/PlayerManager";
import Entity from "./Entity";
//STUB END "Imports"

export default class Game extends Watcher {
    constructor({ fps = 2, GCD = 1000 } = {}) {
    // constructor({ fps = 24, GCD = 1500 } = {}) {
        super([], {}, { deep: false });

        this.loop = new Pulse(fps, { autostart: false });
        this.players = new PlayerManager();

        this.config = {
            GCD,
            render: {
                tile: {
                    width: 32,
                    height: 32,
                },
            },
            SHOW_UI: true,
            MOUSE_POSITION: [ 10, 10 ],
        };

        // Create Singleton pattern
        if(!Game.Instance) {
            Game.Instance = this;
        }
        
        this.loop.$.subscribe((prop, value) => this.onTick.call(this, value));
    }

    onTick({ dt, now } = {}) {
        for(let entity of this.world.current.entities.values) {
            if(now - entity.turn.timeout >= this.config.GCD) {
                entity.turn.current(entity);
                entity.turn.timeout = now;
            }
        }
    }

    // Access Singleton pattern via Game._
    static get _() {
        if(!Game.Instance) {
            Game.Instance = new Game();
            const game = Game.Instance;

            game.world = new WorldManager(game);
            game.world.add(World.CreateRandom(25, 25, 1), "overworld");
            game.world.add(
                Arena.CreateArena(game.world.get("overworld"), 10, 10, {
                    entities: [
                        game.world.get("overworld").entities.player,
                    ],
                }),
                "arena",
            );

            const player = Entity.FromSchema([
                [ componentMeta, { type: EnumEntityType.SQUIRREL } ],
                [ componentPosition, { x: 4, y: 7 } ],
                [ componentHealth, { current: 10, max: 10 } ],
                [ componentAction, {} ],
                [ componentTurn, { timeout: () => Agency.Util.Dice.random(0, 2499), current: () => (entity) => {
                    if(entity.movement.path.length) {
                        const [ x, y ] = entity.movement.path.shift();
                        const { x: ox, y: oy } = entity.position;
        
                        entity.position.x = x;
                        entity.position.y = y;
        
                        if(x !== ox) {
                            if(x > ox) {
                                entity.position.facing = 90;
                            } else if(x < ox) {
                                entity.position.facing = 270;
                            }
                        } else if(y !== oy) {
                            if(y > oy) {
                                entity.position.facing = 180;
                            } else if(y < oy) {
                                entity.position.facing = 0;
                            }
                        }
                    }
                } } ],
            ]);
            game.world.get("overworld").join(player);

            game.players.register(player, "player");

            //#region STUB
            // game.players.$.subscribe(function(prop, value) {
            //     if([ "position.x", "position.y" ].includes(prop)) {
            //         console.log(prop, value);
            //     }
            // });
            
            // game.world.current.entities.$.subscribe(function(prop, value) {
            //     console.log(prop, value);
            // });

            // // STUB  Async testing
            // setTimeout(() => {
            //     //STUB  Change the World at interval
            //     let bool = true;
            //     setInterval(() => {
            //         if(bool) {
            //             game.world.migrate(game.players.player, "arena");

            //             game.render.width = game.world.get("arena").width * 32;
            //             game.render.height = game.world.get("arena").height * 32;
            //         } else {
            //             game.world.migrate(game.players.player, "overworld");

            //             game.render.width = game.world.get("overworld").width * 32;
            //             game.render.height = game.world.get("overworld").height * 32;
            //         }

            //         game.render.current.setEntityManagers([
            //             0,
            //             1,
            //         ], [
            //             game.world.current.terrain,
            //             game.world.current.entities,
            //         ]).clear().drawLayers();

            //         bool = !bool;
            //     }, 2500);

            //STUB  Testing cases for entities
            // for(let entity of game.world.current.entities.values) {
            //     console.log(entity.health.value.rate);
            // }
            //#endregion

            //? Bootstrap the rendering
            game.render = new RenderManager(game, { repository: initImageRepository() });
            (async () => {
                //  Load Images
                await game.render.loadImages(loadEntity);
                await game.render.loadImages(loadTerrain);

                game.render.useGroup(new RenderGroup(
                    game,
                    game.world.get("overworld").width * game.config.render.tile.width,
                    game.world.get("overworld").height * game.config.render.tile.height,
                    [
                        new RenderLayer(game.world.get("overworld").terrain, { painter: createTerrainLayer, comparator: terrainLayerComparator, config: { clearBeforeDraw: false } }),
                        new RenderLayer(game.world.get("overworld").entities, { painter: createEntityLayer, comparator: entityLayerComparator, config: { clearBeforeDraw: true } }),
                        new RenderLayer([], { config: { clearBeforeDraw: true } }),
                    ],
                    {
                        tw: 32,
                        th: 32,
                    },
                ), "overworld");
    
                game.render.eraseFirst();
                game.render.onDraw = (dt, elapsed) => {
                    if(Math.random() > 0.99) {
                        // console.log(game.render.canvas.toDataURL())
                    }

                    game.render.drawLayers();
                };
            
                game.render.current.getLayer(2).addHook(function(dt, elapsed) {
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
                game.render.current.getLayer(2).addHook(function(dt, elapsed) {
                    if(game.config.SHOW_UI) {
                        this.save();
                        const player = game.players.player;
                        // const player = game.world.current.entities.player;
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


                //? Key and Mouse Bindings
                window.onkeypress = e => {
                    e.preventDefault();

                    if(e.key === "v") {
                        game.config.SHOW_UI = !game.config.SHOW_UI;
                    }
                };
                game.render.__handler.$.subscribe((type, entry) => {
                    const [ e ] = entry.data;
                    const { target: canvas, button, clientX: x, clientY: y } = e;

                    const { left, top } = canvas.getBoundingClientRect();
                    const pos = {
                        px: x - left,
                        py: y - top,
                    };
                    pos.tx = pos.px / game.config.render.tile.width;
                    pos.ty = pos.py / game.config.render.tile.height;
                    pos.txi = Math.floor(pos.tx);
                    pos.tyi = Math.floor(pos.ty);

                    if(type === "mouseup") {
                        if(button === 0) {
                            // console.info(pos.txi, pos.tyi, JSON.stringify(game.world.current.getTerrain(pos.txi, pos.tyi).terrain.toData()));
                            console.info(pos.txi, pos.tyi, game.world.current.node(pos.txi, pos.tyi));
                        } else if(button === 2) {
                            const player = game.players.player;
                            // const player = game.world.current.entities.player;
                            player.movement.destination = [ pos.txi, pos.tyi ];
                            player.movement.path = findPath(game.world.current, [ player.position.x, player.position.y ], player.movement.destination);
                        }
                    } else if(type === "mousemove") {
                        game.config.MOUSE_POSITION = [ pos.txi, pos.tyi ];
                    }
                });
            })();

            game.loop.start();

            Game.Instance = game;
        }

        return Game.Instance;
    }
}