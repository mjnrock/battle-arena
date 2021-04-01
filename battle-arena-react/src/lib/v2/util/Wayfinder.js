import Path, { EnumPathStatus } from "./Path";

export class Wayfinder {
    constructor(entity, paths = []) {
        this.entity = entity;

        this.__paths = paths;
    }
    
    get paths() {
        return this.__paths;
    }
    set paths(paths) {
        this.__paths = paths;
    }

    get hasPath() {
        return this.current && this.current.isActive === true;
    }
    get current() {
        return this.__paths[ 0 ] || {};
    }
    get last() {
        return this.__paths[ this.__paths.length ? this.__paths.length - 1 : 0 ] || {};
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
        this.paths.push(...paths);

        this.start();

        return this;
    }
    set(path) {
        this.paths = [ path ];

        this.start();

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
};

export default Wayfinder;