import Agency from "@lespantsfancy/agency";
import AgencyLocal from "./util/agency/package";

//STUB START "Imports" for stub below
    import World from "./World";
    import GameLoop from "./GameLoop";
    import WorldManager from "./manager/WorldManager";
    import PlayerManager from "./manager/PlayerManager";
    import Entity from "./entity/Entity";
    import { EnumEntityType } from "./entity/component/Meta";
    import Action from "./entity/component/Action";

    import Portal from "./util/Portal";

    import initializeHandlers from "./data/handlers/_init";
    import initializeRenderers from "./data/render/_init";
    import initializeBindings from "./data/input/_init";
//STUB END "Imports"

export default class Game extends AgencyLocal.Watcher {
    // constructor({ fps = 4, GCD = 1000 } = {}) {
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
        this.loop.setEnd(this.onPostTick.bind(this));

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
    onPostTick(fps, panic) {
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

            Game.Instance = new Game();
            const game = Game.Instance;

            initializeHandlers(game);

            game.world = new WorldManager(game);
            game.world.register(World.CreateRandom(game, 25, 25, 15), "overworld");
            game.world.register(World.CreateRandom(game, 25, 25, 10), "arena");

            game.world.overworld.openPortal(10, 10, new Portal(game.world.arena, { x: 15, y: 15, activator: Action.IsInteracting }));
            game.world.arena.openPortal(10, 10, new Portal(game.world.overworld, { x: 15, y: 15, activator: Action.IsInteracting }));

            const player = Entity.FromSchema(game, {
                meta: { type: EnumEntityType.SQUIRREL },
                world: { x: 4, y: 7 },
                health: { args: { current: 10, max: 10 } },
                action: {},
            }, (entity) => {
                entity.world.wayfinder.entity = entity;
            });

            game.world.overworld.joinWorld(player);

            game.players.register(player, "player");
            
            (async () => {
                await initializeRenderers(game);

                //? Key and Mouse Bindings
                await initializeBindings(game);
            })();

            Agency.Event.Network.$.router.useBatchProcess();    // Return to batch process before game loop starts
            game.loop.start();

            Game.Instance = game;
        }

        return Game.Instance;
    }
}