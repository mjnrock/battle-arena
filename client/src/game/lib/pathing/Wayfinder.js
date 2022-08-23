import Helper from "../../util/helper";
import Path, { EnumPathStatus } from "./Path";

export class Wayfinder {
    constructor(entity, paths = []) {
        this.entity = entity;
        this.paths = paths;
    }

    get hasPath() {
        return this.current && this.current.isActive === true;
    }
    get current() {
        return this.paths[ 0 ] || {};
    }
    get last() {
        return this.paths[ this.paths.length ? this.paths.length - 1 : 0 ] || {};
    }

    isCurrentDestination(...args) {
        return Path.isPoint((this.current.destination || []), ...args);
    }
    isCurrentOrigin(...args) {
        return Path.isPoint((this.current.origin || []), ...args);
    }
    isInCurrentPath(...args) {
        for(let [ px, py ] of (this.current.path || [])) {
            if(Path.isPoint([ px, py ], ...args)) {
                return true;
            }
        }

        return false;
    }

    start() {
        if(this.current.status === EnumPathStatus.NOT_STARTED) { 
            this.current.start();
        }
    }

    add(...paths) {
        for(let path of paths) {            
            if(path instanceof Path) {
                this.paths.push(path);
            }
        }

        if(this.paths.length) {
            this.start();
        }

        return this;
    }
    set(path) {
        if(path instanceof Path) {
            this.paths = [ path ];

            this.start();
        }

        return this;
    }

    drop() {
        if(!this.current.isActive) {
            this.paths.shift();

            this.start();

            return true;
        } else if(this.current.isActive) {
            const [ nx, ny ] = this.current.next;

            // If entity gets more than 1 tile away from the next tile, empty
            if(this.entity.world.x < nx - 1 || this.entity.world.x > nx + 1 || this.entity.world.y < ny - 1 || this.entity.world.y > ny + 1) {
                this.empty();
            }
        }

        return false;
    }
    empty() {
        this.paths.forEach(p => p.status = EnumPathStatus.INTERRUPTED);
        this.paths = [];

        return this;
    }

    waypoint(world, x, y) {
        const [ dx, dy ] = this.last.destination || [ this.entity.world.x, this.entity.world.y ];

        this.add(Path.FindPath(world, [ dx, dy ], [ x, y ]));
    }

	//FIXME: This doesn't feel like the right place for this.
	process() {
		const { x, y } = this.entity.world;

		let Vx = this.entity.world.vx,
			Vy = this.entity.world.vy;

		if(this.hasPath) {
			this.current.test(x, y);

			let [ nx, ny ] = this.current.current;

			if(nx === void 0 || ny === void 0) {
				[ nx, ny ] = [ x, y ];
			}

			Vx = Helper.round(-(x - nx), 10);
			Vy = Helper.round(-(y - ny), 10);

			//NOTE  Tween manipulation would go here (e.g. a bounce effect), instead of unitizing
			//FIXME @this.entity.world.speed >= 3 overshoots the tile, causing jitters.  Overcompensated movement must be discretized and applied sequentially to each progressive step in the Path.
			let factor = 1;
			if(Vx < 0) {
				Vx = -factor * this.entity.world.speed;
			} else if(Vx > 0) {
				Vx = factor * this.entity.world.speed;
			}
			if(Vy < 0) {
				Vy = -factor * this.entity.world.speed;
			} else if(Vy > 0) {
				Vy = factor * this.entity.world.speed;
			}
		} else {
			this.drop();
		}
            
		this.entity.world.vx = Vx;
		this.entity.world.vy = Vy;
	}
};

export default Wayfinder;