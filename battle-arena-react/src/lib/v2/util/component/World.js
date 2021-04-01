import Component from "./Component";

import Wayfinder from "../Wayfinder";

export class World extends Component {
    static Name = "world";
    static DefaultProperties = () => ({
        world: null,
        facing: 0,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        speed: 2.5,
        range: 10,
    });

    constructor(game, entity, state = {}) {
        super(World.Name, game, entity, {
            ...World.DefaultProperties(),
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
    //     const path = Path.FindPath(world, [ entity.world.x, entity.world.y ], [ tx, ty ]);

    //     this.wayfinder.set(path);
    // }

    static Has(entity) {
        return World.Name in entity;
    }
};

export default World;