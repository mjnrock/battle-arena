import Agency from "@lespantsfancy/agency";
import Component from "./Component";

import MapWorld from "./../../World";
import Wayfinder from "./../../util/Wayfinder";

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

    getCurrentWorld() {
        return this.game.world[ this.world ];
    }
    getCurrentNode() {
        const world = this.getCurrentWorld();

        if(world instanceof MapWorld) {
            return world.node(~~this.x, ~~this.y);
        }
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
    
    onPreTick(spf, now) {
        const world = this.game.world[ this.entity.world.world ];
        if(world instanceof MapWorld) {
            world.nodes.move(this.entity);

            /** NOTE:    Odd Path Following
             * The ~~ operator setup here causes only SOUTHEAST movements
             * to appear correct, while all other directions suffer from
             * "technically" being in the tile, thus the <Path> continues.
             * 
             * This should resolve itself after the transition to center of
             * mass positions, instead of top-left of tile box.
             * 
             * FIXME:   @this.entity.world.speed that exceeds a tile width/height
             * will prevent the progression of a <Path>, as it will miss the next
             * tile.
             * 
             * FIXME:   If a tile becomes occupied while another this.entity is traveling
             * to that tile, a collision occurs.  Create a "wait if path obstructed"
             * time threshold before the this.entity either: 1) drops its path, or 2) recalculates
             * it to the same destination.  Check World..Node of Path..next to see if still traversable.
             */
            let Vx = this.entity.world.vx,
                Vy = this.entity.world.vy;
                
            if(this.entity.world.wayfinder.hasPath) {
                this.entity.world.wayfinder.current.test(this.entity.world.x, this.entity.world.y);

                let [ nx, ny ] = this.entity.world.wayfinder.current.current;

                if(nx === void 0 || ny === void 0) {
                    [ nx, ny ] = [ this.entity.world.x, this.entity.world.y ];
                }

                Vx = Agency.Util.Helper.round(-(this.entity.world.x - nx), 10);
                Vy = Agency.Util.Helper.round(-(this.entity.world.y - ny), 10);

                //NOTE  Tween manipulation would go here (e.g. a bounce effect), instead of unitizing
                //FIXME @this.entity.world.speed >= 3 overshoots the tile, causing jitters.  Overcompensated movement must be discretized and applied sequentially to each progressive step in the Path.
                if(Vx < 0) {
                    Vx = -1 * this.entity.world.speed;
                    this.entity.world.facing = 270;
                } else if(Vx > 0) {
                    Vx = 1 * this.entity.world.speed;
                    this.entity.world.facing = 90;
                }
                if(Vy < 0) {
                    Vy = -1 * this.entity.world.speed;
                    this.entity.world.facing = 0;
                } else if(Vy > 0) {
                    Vy = 1 * this.entity.world.speed;
                    this.entity.world.facing = 180;
                }
            } else {
                this.entity.world.wayfinder.drop();
            }
            
            this.entity.world.vx = Vx;
            this.entity.world.vy = Vy;
        }
    }
    onTick(dt, now) {
        this.applyVelocity(dt);
    }
};

export default World;