import Agency from "@lespantsfancy/agency";

import Component from "./Component";
import World from "../../World";

import Task from "./lib/Task";
import Path from "./../../util/Path";

const Repository = {
    AI: {
        Test: function(game, entity, data) {
            if(Agency.Util.Dice.coin()) {
                this.current = Repository.MOVE.Persist;
            } else {
                this.current = Repository.MOVE.RandomPath;
            }
        },
    },
    MOVE: {
        Persist: {
            executer: () => {
                // console.log("Yup");
            }
        },
        RandomPath: {
            activator: (game, entity) => !entity.world.wayfinder.hasPath || entity.world.wayfinder.isCurrentDestination(entity.world),
            executer: (game, entity) => {
                const world = game.world[ entity.world.world ];
    
                if(world instanceof World) {
                    const [ tx, ty ] = [
                        Agency.Util.Dice.random(0, world.width - 1),
                        Agency.Util.Dice.random(0, world.height - 1),
                    ];
                    const path = Path.FindPath(world, [ entity.world.x, entity.world.y ], [ tx, ty ]);
    
                    entity.world.wayfinder.set(path);
                }
            },
            cooldown: 500,
        },
    }
}

export class Action extends Component {
    static Events = [
        "interaction",
    ];

    static Name = "action";
    static DefaultProperties = () => ({
        current: null,
        ai: () => Repository.AI.Test,
        data: {},
        actions: {},
        queue: new Set(),
        cooldown: null,
        interaction: 0,
        throttle: () => (dt) => Agency.Util.Dice.permille(1.0 * dt),    // Determines how frequently a decision should be made, if possible.  (1.0 * dt ~= 1 choice/second, or @24fps ~4% per tick)
    });

    constructor(game, entity, state = {}) {
        super(Action.Name, game, entity, {
            ...Action.DefaultProperties(),
            ...state,
        });
    }

    interact() {
        this.interaction = Date.now();

        this.$.emit("interaction", this.entity);

        return this;
    }
    get isInteracting() {
        const now = Date.now();

        return (now - this.interaction) <= this.game.config.time.interaction;
    }    
    static IsInteracting = entity => this.Has(entity) && entity.action.isInteracting;

    onTick(dt, now) {
        if(!this.cooldown) {
            if(this.throttle(dt, now) === true) {
                this.ai.call(this, this.game, this.entity, this.data);

                this.cooldown = Task.Perform(this.current, this.game, this.entity);
            }
        } else if(this.cooldown.isComplete) {
            this.cooldown = null;
        }
    }
};

export default Action;