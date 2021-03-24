import AStar from "./AStar";
import Watchable from "./Watchable";

export const EnumPathStatus = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    INTERRUPTED: 2,
    COMPLETED: 3,
};

export class Path extends Watchable {
    constructor(origin, destination, path) {
        super();

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
    
            if(~~x === cx && ~~y === cy) {
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
    const path = algorithm(world, origin, destination);

    return new Path(origin.map(v => ~~v), destination.map(v => ~~v), path);
};

Path.FindPath = FindPath;

export default Path;