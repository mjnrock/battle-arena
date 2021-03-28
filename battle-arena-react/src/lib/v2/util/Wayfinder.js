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
        return this.current.isActive;
    }
    get current() {
        return this.__paths[ 0 ] || [];
    }
    get last() {
        return this.__paths[ this.__paths.length ? this.__paths.length - 1 : 0 ] || [];
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
            if(this.entity.position.x < nx - 1 || this.entity.position.x > nx + 1 || this.entity.position.y < ny - 1 || this.entity.position.y > ny + 1) {
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
        const [ dx, dy ] = this.last.destination || [ this.entity.position.x, this.entity.position.y ];

        this.add(Path.FindPath(world, [ dx, dy ], [ x, y ]));
    }
};

export default Wayfinder;