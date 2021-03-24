import Helper from "./helper";
import AStar from "./AStar";

export const EnumPathStatus = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    INTERRUPTED: 2,
    COMPLETED: 3,
};

export class Path {
    constructor(origin, destination, path) {
        this.origin = origin;
        this.destination = destination;
        this.path = path;

        this.step = 0;
        this.status = EnumPathStatus.NOT_STARTED;
        this.timestamp = {
            start: null,
            end: null,
        };
    }

    get isActive() {
        return this.status === EnumPathStatus.IN_PROGRESS;
    }

    get previous() {
        if(this.status === EnumPathStatus.IN_PROGRESS) {
            if((this.step - 1) >= 0 && (this.step - 1) < this.path.length) {
                return this.path[ this.step - 1 ];
            }
        }

        return [];
    }
    get current() {
        if(this.step >= 0 && this.step < this.path.length) {
            return this.path[ this.step ];
        }

        return [];
    }
    get next() {
        if(this.status === EnumPathStatus.IN_PROGRESS) {
            if((this.step + 1) >= 0 && (this.step + 1) < this.path.length) {
                return this.path[ this.step + 1 ];
            }
        }

        return [];
    }
    
    get remaining() {
        return this.path.slice(this.step);
    }

    start() {
        if(this.status === EnumPathStatus.NOT_STARTED) {
            this.status = EnumPathStatus.IN_PROGRESS;
            this.timestamp.start = Date.now();
            
            return true;
        }

        return false;
    }
    test(x, y) {
        if(this.status === EnumPathStatus.IN_PROGRESS) {
            const [ cx, cy ] = this.current;
    
            if(Helper.round(x, 10) === Helper.round(cx, 10) && Helper.round(y, 10) === Helper.round(cy, 10)) {
                ++this.step;
    
                if(this.step >= this.path.length) {
                    this.status = EnumPathStatus.COMPLETED;
                    this.timestamp.end = Date.now();
                }

                return true;
            }
        }

        return false;
    }
};

export function FindPath(world, origin, destination, { algorithm = AStar } = {}) {
    origin = origin.map(v => ~~v);
    destination = destination.map(v => ~~v);

    const path = algorithm(world, origin, destination);

    return new Path(origin, destination, path);
};

Path.FindPath = FindPath;

export default Path;