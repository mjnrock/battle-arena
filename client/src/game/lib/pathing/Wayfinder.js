import Path, { EnumPathStatus } from "./Path";

export class Wayfinder {
    constructor(paths = []) {
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
    empty() {
        this.paths.forEach(p => p.status = EnumPathStatus.INTERRUPTED);
        this.paths = [];

        return this;
    }

	/**
	 * This uses the current position of @entity
	 */
    drop(current = []) {
		/**
		 * Really here to allow for { x, y } objects to be passed, too
		 */
		const [ x, y ] = Path.NormalizePoint(current);

        if(!this.current.isActive) {
            this.paths.shift();

            this.start();

            return true;
        } else if(this.current.isActive) {
            const [ nx, ny ] = this.current.next;

            // If entity gets more than 1 tile away from the next tile, empty
            // if(x < nx - 1 || x > nx + 1 || y < ny - 1 || y > ny + 1) {
            //     this.empty();
            // }
        }

        return false;
    }
	/**
	 * This uses the current position of @entity
	 */
    waypoint(current = [], world, x, y) {
		/**
		 * Really here to allow for { x, y } objects to be passed, too
		 */
		const [ cx, cy ] = Path.NormalizePoint(current);
        const [ dx, dy ] = this.last.destination || [ cx, cy ];

        this.add(Path.FindPath(world, [ dx, dy ], [ x, y ]));
    }
};

export default Wayfinder;