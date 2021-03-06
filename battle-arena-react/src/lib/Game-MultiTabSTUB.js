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

    import initializeComponentRegistry from "./entity/component/_init";
    import initializeEffectRegistry from "./data/entity/effects/_init";
    import initializeActionRegistry from "./action/_init";

    import initializeHandlers from "./data/handlers/_init";
    import initializeRenderers from "./data/render/_init";
//STUB END "Imports"


Agency.Event.Network.Instances.register(new Agency.Event.Network(), "agency");
Agency.Event.Network.Instances.agency.router.createContexts([
    [ "test", {
        handlers: {
            "*": function(args) {
                console.log(this.emitter.id, args);
            },
        },
    }],
]);
Agency.Event.Network.Instances.agency.router.createRoutes([
    payload => {
        return "test";
    },
]);
Agency.Event.Network.Instances.agency.router.useRealTimeProcess();
// tab 1
var ch = new BroadcastChannel('test');
ch.postMessage('some data');

// tab 2
var ch = new BroadcastChannel('test');
ch.addEventListener('message', function (e) {
    console.log('Message:', e.data);
});

export default class Game extends AgencyLocal.Watcher {
    // constructor({ fps = 4, GCD = 1000 } = {}) {
    constructor({ fps = 24 } = {}) {
        super([], { deep: false });

        this.INTERCOM = new Agency.Event.Emitter({}, { injectMiddleware: false });
        Agency.Event.Network.Instances.agency.join(this.INTERCOM);

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

        // Create Singleton pattern
        if(!Game.Instance) {
            Game.Instance = this;
        }
        
        this.loop.setTick(this.onTick.bind(this));
        this.loop.setPreTick(this.onPreTick.bind(this));
        this.loop.setDraw(this.onDraw.bind(this));
        this.loop.setEnd(this.onPostTick.bind(this));

        //FIXME Probably should make this more robust
        // window.onfocus = e => this.loop.start();
        // window.onblur = e => this.loop.stop();
    }

    onPreTick(spf, now) {
        for(let world of this.world) {
            world.onPreTick(spf, now);
        }
        // this.world.current.onPreTick(spf, now);
    }
    onTick(dt, now) {
        //STUB
        if(Math.random() > 0.9) {
            this.INTERCOM.$.emit("msg", Math.random());
        }

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

    // Access Singleton pattern via Game._
    static get _() {
        if(!Game.Instance) {
            Agency.Event.Network.$.router.useRealTimeProcess();     // Process all setup events as they fire

            initializeComponentRegistry();
            initializeEffectRegistry();
            initializeActionRegistry();

            Game.Instance = new Game();
            const game = Game.Instance;

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
            
            (async () => {
                await initializeRenderers(game);

                console.log(game.render.repository)
            })();

            Agency.Event.Network.$.router.useBatchProcess();    // Return to batch process before game loop starts
            game.loop.start();

            Game.Instance = game;
        }

        return Game.Instance;
    }
}