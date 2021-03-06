import Helper from "@lespantsfancy/agency/src/util/helper";
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
        //!GRID-NUDGE
        this.path = path.map(([ x, y ]) => [ x + 0.5, y + 0.5 ]);

        this.step = 0;
        this.status = EnumPathStatus.NOT_STARTED;
        this.timestamp = {
            start: null,
            end: null,
        };
    }

    static isPoint(end, ...args) {
        const [ dx, dy ] = end;
        let x = Infinity,
            y = Infinity;

        if(Array.isArray(args[ 0 ])) {
            [ x, y ] = args[ 0 ];
        } else if(typeof args[ 0 ] === "object") {
            x = args[ 0 ].x;
            y = args[ 0 ].y;
        } else {
            [ x, y ] = args;
        }

        return ~~x === ~~dx && ~~y === ~~dy;
    }

    isDestination(...args) {
        return Path.isPoint(this.destination, ...args);
    }
    isOrigin(...args) {
        return Path.isPoint(this.origin, ...args);
    }
    isInPath(...args) {
        for(let [ px, py ] of this.path) {
            if(Path.isPoint([ px, py ], ...args)) {
                return true;
            }
        }

        return false;
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
    //!GRID-NUDGE
    origin = origin.map(v => ~~v);
    destination = destination.map(v => ~~v);

    const path = algorithm(world, origin, destination);

    if(path.length) {
        return new Path(origin, destination, path);
    }

    return false;
};

Path.FindPath = FindPath;

export default Path;