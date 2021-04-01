import Agency from "@lespantsfancy/agency";

import Component from "./Component";
import World from "../../World";

import Task from "./lib/Task";
import Path from "./../../util/Path";

const Repository = {
    MOVE: {
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
    static Name = "action";
    static DefaultProperties = () => ({
        current: null,
        cooldown: null,
        ai: null,
        actions: {},
        queue: new Set(),
        throttle: null,
    });

    constructor(game, entity, state = {}) {
        super(Action.Name, game, entity, {
            ...Action.DefaultProperties(),
            ...state,
        });

        this.current = Repository.MOVE.RandomPath;
        this.throttle = (dt) => Agency.Util.Dice.permille(0.15 * dt);
    }

    onTick(dt, now) {
        if(!this.cooldown) {
            if(this.throttle(dt, now) === true) {
                this.cooldown = (new Task(this.current)).perform(this.game, this.entity);
            }
        } else if(this.cooldown.isComplete) {
            this.cooldown = null;
        }
    }
};

export default Action;