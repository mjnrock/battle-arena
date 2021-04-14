import Agency from "@lespantsfancy/agency";
import Component from "./Component";

export const EnumMovement = {
    UP: 1 << 0,
    DOWN: 1 << 1,
    LEFT: 1 << 2,
    RIGHT: 1 << 3,
};

export class Player extends Component {
    static Name = "player";
    static DefaultProperties = () => ({
        movement: 0,
    });

    constructor(game, entity, state = {}) {
        super(Player.Name, game, entity, {
            ...Player.DefaultProperties(),
            ...state,
        });
    }

    onTick(dt, now) {
        let dx = 0,
            dy = 0;

        if(Agency.Util.Bitwise.has(this.movement, EnumMovement.LEFT)) {
            this.entity.world.vx = -1;
        }
        if(Agency.Util.Bitwise.has(this.movement, EnumMovement.RIGHT)) {
            this.entity.world.vx = 1;
        }
        if(Agency.Util.Bitwise.has(this.movement, EnumMovement.UP)) {
            this.entity.world.vy = -1;
        }
        if(Agency.Util.Bitwise.has(this.movement, EnumMovement.DOWN)) {
            this.entity.world.vy = 1;
        }

        if(this.movement) {
            if(!this.entity.world.wayfinder.hasPath) {
                if(Math.abs(this.entity.world.vx) === 1 && Math.abs(this.entity.world.vy) === 1) {
                    this.entity.world.vx = Math.sign(this.entity.world.vx) * 0.707;
                    this.entity.world.vy = Math.sign(this.entity.world.vy) * 0.707;
                }

                this.entity.world.vx *= this.entity.world.speed;
                this.entity.world.vy *= this.entity.world.speed;
            } else {
                this.entity.world.wayfinder.empty();
            }
        }

        if(!(Agency.Util.Bitwise.has(this.movement, EnumMovement.LEFT) || Agency.Util.Bitwise.has(this.movement, EnumMovement.RIGHT))) {
            this.entity.world.vx = 0;
        }
        if(!(Agency.Util.Bitwise.has(this.movement, EnumMovement.UP) || Agency.Util.Bitwise.has(this.movement, EnumMovement.DOWN))) {
            this.entity.world.vy = 0;
        }
    }
}

export default Player;