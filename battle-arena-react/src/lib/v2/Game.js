// import Agency from "@lespantsfancy/agency";
import AgencyLocal from "./util/agency/package";

//STUB START "Imports" for stub below
    import World from "./World";
    import GameLoop from "./GameLoop";
    import RenderManager from "./manager/RenderManager";
    import WorldManager from "./manager/WorldManager";
    import PlayerManager from "./manager/PlayerManager";
    import Entity from "./entity/Entity";
    import { EnumEntityType } from "./entity/component/Meta";
    import Action from "./entity/component/Action";

    import Path from "./util/Path";
    import Portal from "./util/Portal";

    import initImageRepository from "./data/render/repository";
    import { loadEntity, loadTerrain } from "./data/render/entity";
    import drawEntityLayer from "./data/render/world-entity-layer";
    import drawTerrainLayer from "./data/render/world-terrain-layer";
    import drawUILayer from "./data/render/world-ui-layer";
//STUB END "Imports"

export default class Game extends AgencyLocal.Watcher {
    // constructor({ fps = 10, GCD = 1000 } = {}) {
    constructor({ fps = 24, GCD = 1000 } = {}) {
        super([], { deep: false });

        this.loop = new GameLoop(fps);
        this.players = new PlayerManager();

        this.config = {
            time: {
                GCD,
                interaction: 250,
            },
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
                for(let comp of entity) {
                    comp.onPreTick.call(comp, spf, now);
                }
            }
        }
    }
    onTick(dt, now) {
        for(let world of this.world) {
            for(let entity of world.entities) {
                for(let comp of entity) {
                    comp.onTick.call(comp, dt, now);
                }
            }
        }
    }

    onDraw(dt, now) {
        this.render.drawAnimationLayers(dt, now);

        // for(let entity of this.world.current.entities) {
        //     for(let comp of entity) {
        //         comp.onDraw.call(comp, dt, now);
        //     }
        // }
    }

    // Access Singleton pattern via Game._
    static get _() {
        if(!Game.Instance) {
            Game.Instance = new Game();
            const game = Game.Instance;

            game.world = new WorldManager(game);
            game.world.register(World.CreateRandom(game, 25, 25, 15), "overworld");
            game.world.register(World.CreateRandom(game, 25, 25, 10), "arena");

            // game.world.overworld.openPortal(10, 10, new Portal(game.world.arena, { x: 15, y: 15 }));
            // game.world.arena.openPortal(10, 10, new Portal(game.world.overworld, { x: 15, y: 15 }));
            game.world.overworld.openPortal(10, 10, new Portal(game.world.arena, { x: 15, y: 15, activator: Action.IsInteracting }));
            game.world.arena.openPortal(10, 10, new Portal(game.world.overworld, { x: 15, y: 15, activator: Action.IsInteracting }));

            const player = Entity.FromSchema(game, [
                [ { meta: null }, { type: EnumEntityType.SQUIRREL } ],
                //FIXME Entity.FromSchema gets the key from args[ 0 ] during the transition
                [ { world: null }, { x: 4, y: 7 } ],
                [ { health: null }, { args: { current: 10, max: 10 } } ],
                [ { action: null}, {} ],
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
                    tw: game.config.render.tile.width,
                    th: game.config.render.tile.height,
                    repository: initImageRepository()
                });
                game.render.config.clearBeforeDraw = true;

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

                    if(e.code === "KeyV") {
                        game.config.SHOW_UI = !game.config.SHOW_UI;
                    } else if(e.code === "Space") {
                        game.players.player.action.interact();
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