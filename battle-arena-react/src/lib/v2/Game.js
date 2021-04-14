import Agency from "@lespantsfancy/agency";
import AgencyLocal from "./util/agency/package";

/**
 * NOTE
 *  !GRID-NUDGE
 *      This flag indicates nudge work to line up the paths, rendering, and position of AStar movement
 */

//STUB START "Imports" for stub below
    import World from "./world/World";
    import Maze from "./world/Maze";
    import GameLoop from "./GameLoop";
    import WorldManager from "./manager/WorldManager";
    import PlayerManager from "./manager/PlayerManager";
    import Entity from "./entity/Entity";
    import { EnumEntityCreatureType } from "./entity/component/Meta";
    import Action from "./entity/component/Action";

    import Portal from "./util/Portal";
    import RenderManager from "./manager/RenderManager";

    import initImageRepository from "./data/render/repository";

    import initializeComponentRegistry from "./entity/component/_init";
    import initializeEffectRegistry from "./data/entity/effects/_init";
    import initializeActionRegistry from "./action/_init";

    import initializeHandlers from "./data/handlers/_init";
    import loadRenderables from "./data/render/_init";
//STUB END "Imports"

// export default class Game extends AgencyLocal.Watcher {
export default class Game extends Agency.Event.Emitter {
    // constructor({ fps = 4, GCD = 1000 } = {}) {
    constructor({ fps = 24 } = {}) {
        super();

        this.loop = new GameLoop(fps);
        this.players = new PlayerManager();

        this.config = {
            time: {
                GCD: 500,
                interaction: 250,
            },
            render: {
                tile: {
                    width: 32,
                    height: 32,
                },
            },
            SHOW_UI: true,
            SHOW_DEBUG: false,
            SHOW_HEATMAP: false,
            SHOW_WEAR: true,
            MOUSE_POSITION: [ 10, 10 ],
        };
        
        this.loop.setTick(this.onTick.bind(this));
        this.loop.setPreTick(this.onPreTick.bind(this));
        this.loop.setDraw(this.onDraw.bind(this));
        this.loop.setEnd(this.onPostTick.bind(this));

        //FIXME Probably should make this more robust
        window.onfocus = e => this.loop.start();
        window.onblur = e => this.loop.stop();

        setTimeout(() => {
            this.world.overworld.videoSource.stream();
        }, 1000);
    }

    onPreTick(spf, now) {
        for(let world of this.world) {
            world.onPreTick(spf, now);
        }
        // this.world.current.onPreTick(spf, now);
    }
    onTick(dt, now) {
        for(let world of this.world) {
            world.onTick(dt, now);
        }
        // this.world.current.onTick(dt, now);
    }
    onPostTick(fps, panic) {
        if(panic) {
            console.warn(`MainLoop has panicked, resulting in ${ fps }fps.  Dropping all queued events on 'default' <Network>.`)
            Agency.Event.Network.$.emptyAll();
            this.loop.mainLoop.resetFrameDelta();
        }
        
        Agency.Event.Network.$.processAll();
    }

    onDraw(dt, now) {
        this.render.drawAnimationLayers(dt, now);

        // for(let entity of this.world.current.entities) {
        //     for(let comp of entity) {
        //         comp.onDraw.call(comp, dt, now);
        //     }
        // }
    }

    static CreateGame() {
        Agency.Event.Network.$.router.useRealTimeProcess();     // Process all setup events as they fire

        initializeComponentRegistry();
        initializeEffectRegistry();
        initializeActionRegistry();

        const game = new Game();

        initializeHandlers(game);

        game.world = new WorldManager(game);
        game.world.register(World.CreateRandom(game, 25, 25, 15), "overworld");
        game.world.register(World.CreateRandom(game, 25, 25, 10), "overworld2");

        game.world.overworld.openPortal(10, 10, new Portal(game.world.overworld2, { x: 15.5, y: 15.5, activator: Action.IsInteracting }));
        game.world.overworld2.openPortal(10, 10, new Portal(game.world.overworld, { x: 15.5, y: 15.5, activator: Action.IsInteracting }));          
        
        game.world.register(Maze.CreateRandom(game, 25, 25, game.world.overworld), "maze");
        game.world.overworld.openPortal(2, 2, new Portal(game.world.maze, { activator: Action.IsInteracting }));

        const player = Entity.FromSchema(game, {
            meta: { subtype: EnumEntityCreatureType.SQUIRREL },
            state: {},
            world: { x: 4.5, y: 7.5 },
            health: { args: { current: 1, max: 10 } },
            action: {
                abilities: {
                    holyNova: Agency.Registry._.ability.holyNova,
                    holyLight: Agency.Registry._.ability.holyLight,
                },
            },
        }, (entity) => {
            entity.world.wayfinder.entity = entity;
        });

        game.world.overworld.joinWorld(player);
        // game.world.maze.joinWorld(player);

        game.players.register(player, "player");
        
        game.render = new RenderManager(game, {
            width: game.world.current.width * game.config.render.tile.width,
            height: game.world.current.height * game.config.render.tile.height,
            tw: game.config.render.tile.width,
            th: game.config.render.tile.height,
            repository: initImageRepository()
        });
        game.render.config.clearBeforeDraw = true;
        
        (async () => {
            await loadRenderables(game);

            console.log(game.render.repository)
            game.loop.start();

            game.$.emit("start", Date.now());
        })();

        Agency.Event.Network.$.router.useBatchProcess();    // Return to batch process before game loop starts

        Game._ = game;
        return game;
    }
}