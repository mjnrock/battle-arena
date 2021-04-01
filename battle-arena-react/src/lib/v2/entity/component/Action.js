import Agency from "@lespantsfancy/agency";

import Component from "./Component";
import World from "../../World";

import Task from "./lib/Task";
import Path from "./../../util/Path";

const Repository = {
    MOVE: {
        Persist: {
            executer: () => {
                console.log("Yup");
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
    static Name = "action";
    static DefaultProperties = () => ({
        current: () => Repository.MOVE.RandomPath,
        cooldown: null,
        ai: null,
        actions: {},
        queue: new Set(),
        throttle: () => (dt) => Agency.Util.Dice.permille(0.15 * dt),
    });

    constructor(game, entity, state = {}) {
        super(Action.Name, game, entity, {
            ...Action.DefaultProperties(),
            ...state,
        });
    }

    onTick(dt, now) {
        if(!this.cooldown) {
            if(this.throttle(dt, now) === true) {
                //STUB
                if(Agency.Util.Dice.coin()) {
                    this.current = Repository.MOVE.Persist;
                } else {
                    this.current = Repository.MOVE.RandomPath;
                }

                this.cooldown = Task.Perform(this.current, this.game, this.entity);
            }
        } else if(this.cooldown.isComplete) {
            this.cooldown = null;
        }
    }
};

export default Action;