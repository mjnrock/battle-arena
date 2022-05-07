import Entity from "../Entity";
import Component from "./Component";

export class Effect extends Component {
    static Name = "effect";
    static DefaultProperties = () => ({
        isActive: true,
        qualifier: null,
        effect: null,
        args: null,
        respawn: 0,
        target: null,
    });

    constructor(game, entity, state = {}) {
        super(Effect.Name, game, entity, {
            ...Effect.DefaultProperties(),
            ...state,
        });
    }

    onTick(spf, now) {
        // "Follow" the @target so the effect will graphically overlay it, even if it moves
        if(this.target instanceof Entity) {
            this.entity.world.x = this.target.world.x;
            this.entity.world.y = this.target.world.y;
        }
    }
};

export default Effect;