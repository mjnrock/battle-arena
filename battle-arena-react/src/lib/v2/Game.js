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

    import drawEntityLayer from "./data/render/world-entity-layer";
    import drawTerrainLayer from "./data/render/world-terrain-layer";
    import drawUILayer from "./data/render/world-ui-layer";
    
    import componentMeta, { EnumEntityType } from "./data/entity/components/meta";
    import componentPosition from "./data/entity/components/position";
    import componentTurn from "./data/entity/components/turn";
    import componentHealth from "./data/entity/components/health";
    import componentMovement, { hasMovement } from "./data/entity/components/movement";
import RenderGroup from "./util/render/RenderGroup";
import WorldManager from "./manager/WorldManager";
import Arena from "./Arena";
import PlayerManager from "./manager/PlayerManager";
import Entity from "./Entity";
import Animator from "./util/render/Animator";
import Path from "./util/Path";
//STUB END "Imports"

export default class Game extends Watcher {
    // constructor({ fps = 2, GCD = 1000 } = {}) {
    constructor({ fps = 20, GCD = 1000 } = {}) {
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

            /** NOTE:    Odd Path Following
             * The ~~ operator setup here causes only SOUTHEAST movements
             * to appear correct, while all other directions suffer from
             * "technically" being in the tile, thus the <Path> continues.
             * 
             * This should resolve itself after the transition to center of
             * mass positions, instead of top-left of tile box.
             * 
             * FIXME:   @entity.movement.speed that exceeds a tile width/height
             * will prevent the progression of a <Path>, as it will miss the next
             * tile.
             */
            let Vx = entity.position.vx,
                Vy = entity.position.vy;
                
            if(hasMovement(entity)) {
                if(entity.movement.wayfinder.hasPath) {
                    entity.movement.wayfinder.current.test(entity.position.x, entity.position.y);

                    let [ nx, ny ] = entity.movement.wayfinder.current.current;

                    if(nx === void 0 || ny === void 0) {
                        [ nx, ny ] = [ ~~entity.position.x, ~~entity.position.y ];
                    }

                    Vx = Math.round(-(~~entity.position.x - nx));
                    Vy = Math.round(-(~~entity.position.y - ny));

                    //TODO  Tween manipulation would go here (e.g. a bounce effect), instead of unitizing
                    if(Vx < 0) {
                        Vx = -1 * entity.movement.speed;
                    } else if(Vx > 0) {
                        Vx = 1 * entity.movement.speed;
                    }
                    if(Vy < 0) {
                        Vy = -1 * entity.movement.speed;
                    } else if(Vy > 0) {
                        Vy = 1 * entity.movement.speed;
                    }

                    const { x: ox, y: oy } = entity.position;

                    if(nx !== ox) {
                        if(nx > ox) {
                            entity.position.facing = 90;
                        } else if(nx < ox) {
                            entity.position.facing = 270;
                        }
                    } else if(ny !== oy) {
                        if(ny > oy) {
                            entity.position.facing = 180;
                        } else if(ny < oy) {
                            entity.position.facing = 0;
                        }
                    }
                } else {
                    entity.movement.wayfinder.drop();
                }
            }

            if(Vx || Vy) {
                entity.position.x += Vx * dt;
                entity.position.y += Vy * dt;
            }
            
            entity.position.vx = Vx;
            entity.position.vy = Vy;
        }
    }

    // Access Singleton pattern via Game._
    static get _() {
        if(!Game.Instance) {
            Game.Instance = new Game();
            const game = Game.Instance;

            game.world = new WorldManager(game);
            game.world.add(World.CreateRandom(25, 25, 2), "overworld");
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
                [ componentMovement, {} ],
                [ componentTurn, { timeout: () => Agency.Util.Dice.random(0, 2499), current: () => (entity) => {} } ],
            ], (entity) => {
                entity.movement.wayfinder.entity = entity;
            });
            game.world.get("overworld").join(player);

            game.players.register(player, "player");

            game.players.player.$.subscribe(function(prop, value) {
                console.log(prop, value);
            });

            
            //? Bootstrap the rendering
            (async () => {
                game.render = new RenderManager(game, {
                    width: game.world.current.width * game.config.render.tile.width,
                    height: game.world.current.height * game.config.render.tile.height,
                    repository: initImageRepository()
                });

                //  Load Images
                await game.render.loadImages(loadEntity);
                await game.render.loadImages(loadTerrain);

                game.render.addAnimationLayers(
                    drawTerrainLayer,
                    drawEntityLayer,
                    drawUILayer,
                );
                game.render.animator.start();


                //? Key and Mouse Bindings
                window.onkeypress = e => {
                    e.preventDefault();

                    if(e.key === "v") {
                        game.config.SHOW_UI = !game.config.SHOW_UI;
                    }
                };
                // window.onkeydown = e => {
                //     let [ dx, dy ] = [ 0, 0 ];
                //     if(e.key === "w")  {
                //         dy = -1;
                //     } else if(e.key === "a")  {
                //         dx = -1;
                //     } else if(e.key === "s")  {
                //         dy = 1;
                //     } else if(e.key === "d")  {
                //         dx = 1;
                //     }

                //     game.players.player.position.vx = dx;
                //     game.players.player.position.vy = dy;
                // };
                // window.onkeyup = e => {
                //     let [ dx, dy ] = [ game.players.player.position.vx, game.players.player.position.vy ];
                //     if(e.key === "w")  {
                //         dy = 0;
                //     } else if(e.key === "a")  {
                //         dx = 0;
                //     } else if(e.key === "s")  {
                //         dy = 0;
                //     } else if(e.key === "d")  {
                //         dx = 0;
                //     }

                //     game.players.player.position.vx = dx;
                //     game.players.player.position.vy = dy;
                // };
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

                            if(e.shiftKey) {
                                player.movement.wayfinder.waypoint(game.world.current, pos.txi, pos.tyi);
                            } else {
                                const path = Path.FindPath(game.world.current, [ player.position.x, player.position.y ], [ pos.txi, pos.tyi ]);
                                player.movement.wayfinder.set(path);
                            }
                        }
                    } else if(type === "mousemove") {
                        game.config.MOUSE_POSITION = [ pos.txi, pos.tyi ];
                    }
                });
                
                //STUB  Change the World at interval
                // let bool = true;
                // setInterval(() => {
                //     if(bool) {
                //         game.world.migrate(game.players.player, "arena");

                //         game.render.width = game.world.get("arena").width * 32;
                //         game.render.height = game.world.get("arena").height * 32;
                //     } else {
                //         game.world.migrate(game.players.player, "overworld");

                //         game.render.width = game.world.get("overworld").width * 32;
                //         game.render.height = game.world.get("overworld").height * 32;
                //     }

                //     bool = !bool;
                // }, 2500);
            })();

            game.loop.start();

            Game.Instance = game;
        }

        return Game.Instance;
    }
}