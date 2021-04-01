import Component from "./Component";

import Wayfinder from "./../Wayfinder";

export class Position extends Component {
    static Name = "position";
    static DefaultProperties = () => ({
        world: null,
        facing: 0,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
    });

    constructor(game, entity, state = {}) {
        super(Position.Name, game, entity, {
            ...Position.DefaultProperties(),
            ...state,
        });

        this.wayfinder = new Wayfinder(this.entity);
    }

    nudge(dx, dy) {
        this.x += dx;
        this.y += dy;

        return this;
    }
    move(nx, ny) {
        this.x = nx;
        this.y = ny;

        return this;
    }
    accelerate(vx, vy) {
        this.vx += vx;
        this.vy += vy;

        return this;
    }
    
    applyVelocity(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        return this;
    }
    // wayfind() {
    //     const [ tx, ty ] = [ Agency.Util.Dice.random(0, world.width - 1), Agency.Util.Dice.random(0, world.height - 1) ];
    //     const path = Path.FindPath(world, [ entity.position.x, entity.position.y ], [ tx, ty ]);

    //     this.wayfinder.set(path);
    // }

    static Has(entity) {
        return Position.Name in entity;
    }
};

export default Position;