import Agency from "@lespantsfancy/agency";
import AgencyLocal from "./util/agency/package";

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
    import componentHealth from "./data/entity/components/health";
import WorldManager from "./manager/WorldManager";
import PlayerManager from "./manager/PlayerManager";
import Entity from "./Entity";
import Path from "./util/Path";
import Helper from "./util/helper";
import GameLoop from "./GameLoop";
import Portal from "./util/Portal";
import Cooldown from "./util/Cooldown";
import Action from "./util/component/Action";
//STUB END "Imports"

export default class Game extends AgencyLocal.Watcher {
    // constructor({ fps = 10, GCD = 1000 } = {}) {
    constructor({ fps = 24, GCD = 1000 } = {}) {
        super([], { deep: false });

        this.loop = new GameLoop(fps);
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
        
        this.loop.setTick(this.onTick.bind(this));
        this.loop.setPreTick(this.onPreTick.bind(this));
        this.loop.setDraw(this.onDraw.bind(this));

        //FIXME Probably should make this more robust
        // window.onfocus = e => this.loop.start();
        // window.onblur = e => this.loop.stop();
    }

    onPreTick(spf, now) {
        for(let world of this.world) {
            for(let entity of world.entities) {
                if(Action.Has(entity)) {
                    if(!entity.action.cooldown) {
                        entity.action.current(entity);
                        entity.action.cooldown = new Cooldown(this.config.GCD * (Math.random() * 3));
                    } else {
                        if(entity.action.cooldown.isComplete) {
                            entity.action.cooldown = null;
                        }
                    }
                }

                world.nodes.move(entity);

                /** NOTE:    Odd Path Following
                 * The ~~ operator setup here causes only SOUTHEAST movements
                 * to appear correct, while all other directions suffer from
                 * "technically" being in the tile, thus the <Path> continues.
                 * 
                 * This should resolve itself after the transition to center of
                 * mass positions, instead of top-left of tile box.
                 * 
                 * FIXME:   @entity.world.speed that exceeds a tile width/height
                 * will prevent the progression of a <Path>, as it will miss the next
                 * tile.
                 * 
                 * FIXME:   If a tile becomes occupied while another entity is traveling
                 * to that tile, a collision occurs.  Create a "wait if path obstructed"
                 * time threshold before the entity either: 1) drops its path, or 2) recalculates
                 * it to the same destination.  Check World..Node of Path..next to see if still traversable.
                 */
                let Vx = entity.world.vx,
                    Vy = entity.world.vy;
                    
                if(entity.world.wayfinder.hasPath) {
                    entity.world.wayfinder.current.test(entity.world.x, entity.world.y);

                    let [ nx, ny ] = entity.world.wayfinder.current.current;

                    if(nx === void 0 || ny === void 0) {
                        [ nx, ny ] = [ entity.world.x, entity.world.y ];
                    }

                    Vx = Agency.Util.Helper.round(-(entity.world.x - nx), 10);
                    Vy = Agency.Util.Helper.round(-(entity.world.y - ny), 10);

                    //NOTE  Tween manipulation would go here (e.g. a bounce effect), instead of unitizing
                    //FIXME @entity.world.speed >= 3 overshoots the tile, causing jitters.  Overcompensated movement must be discretized and applied sequentially to each progressive step in the Path.
                    if(Vx < 0) {
                        Vx = -1 * entity.world.speed;
                        entity.world.facing = 270;
                    } else if(Vx > 0) {
                        Vx = 1 * entity.world.speed;
                        entity.world.facing = 90;
                    }
                    if(Vy < 0) {
                        Vy = -1 * entity.world.speed;
                        entity.world.facing = 0;
                    } else if(Vy > 0) {
                        Vy = 1 * entity.world.speed;
                        entity.world.facing = 180;
                    }
                } else {
                    entity.world.wayfinder.drop();
                }
                
                entity.world.vx = Vx;
                entity.world.vy = Vy;
            }
        }
    }
    onTick(dt, now) {
        for(let world of this.world) {
            for(let entity of world.entities) {
                entity.world.applyVelocity(dt);
            }
        }
    }

    onDraw(dt, now) {
        this.render.drawAnimationLayers(dt, now);
    }

    // Access Singleton pattern via Game._
    static get _() {
        if(!Game.Instance) {
            Game.Instance = new Game();
            const game = Game.Instance;

            game.world = new WorldManager(game);
            game.world.register(World.CreateRandom(game, 25, 25, 15), "overworld");
            game.world.register(World.CreateRandom(game, 25, 25, 0), "arena");

            game.world.overworld.openPortal(10, 10, new Portal(game.world.arena, { x: 15, y: 15 }));
            game.world.arena.openPortal(10, 10, new Portal(game.world.overworld, { x: 15, y: 15 }));

            const player = Entity.FromSchema(game, [
                [ componentMeta, { type: EnumEntityType.SQUIRREL } ],
                //FIXME Entity.FromSchema gets the key from args[ 0 ] during the transition
                [ { world: null }, { x: 4, y: 7 } ],
                [ componentHealth, { current: 10, max: 10 } ],
                [ { action: null}, { timeout: () => Agency.Util.Dice.random(0, 2499), current: () => (entity) => {} } ],
            ], (entity) => {
                entity.world.wayfinder.entity = entity;
            });

            game.world.overworld.joinWorld(player);

            game.players.register(player, "player");
            
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
                            const occupants = game.world.current.node(pos.txi, pos.tyi).occupants;

                            console.info(pos.txi, pos.tyi, occupants);

                            for(let occupant of occupants) {
                                console.log(Object.assign({}, occupant.world))
                            }
                        } else if(button === 2) {
                            const player = game.players.player;

                            if(e.shiftKey) {
                                player.world.wayfinder.waypoint(game.world.current, pos.txi, pos.tyi);
                            } else {
                                const path = Path.FindPath(game.world.current, [ player.world.x, player.world.y ], [ pos.txi, pos.tyi ]);
                                player.world.wayfinder.set(path);
                            }
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