import Helper from "../../util/helper";
import AStar from "./AStar";

export const EnumPathStatus = {
	NOT_STARTED: 0,
	IN_PROGRESS: 1,
	INTERRUPTED: 2,
	COMPLETED: 3,
};

//TODO: Add subscriptions to event changes
export class Path {
	static Precision = 10;

	constructor ({ origin, destination, path = [] } = {}) {
		this.origin = origin;
		this.destination = destination;
		//! GRID-NUDGE
		this.path = path.map(([ x, y ]) => [ ~~x, ~~y ]);
		// this.path = path.map(([ x, y ]) => [ x + 0.5, y + 0.5 ]);

		this.step = 0;
		this.status = EnumPathStatus.NOT_STARTED;
		this.timestamp = {
			start: null,
			end: null,
		};
	}

	static NormalizePoint(...point) {
		let x = Infinity,
			y = Infinity;

		if(Array.isArray(point[ 0 ])) {
			/**
			 * If the first argument is an array, use it as-is.
			 */
			[ x, y ] = point[ 0 ];
		} else if(typeof point[ 0 ] === "object") {
			/**
			 * If the first argument is an object, use its x and y properties.
			 */
			x = point[ 0 ].x;
			y = point[ 0 ].y;
		} else {
			/**
			 * Otherwise, use the arguments array positional-elements.
			 */
			[ x, y ] = point;
		}

		/**
		 * Prefer the array form
		 */
		return [ x, y ];
	}
	static IsSamePoint(arrPoint, ...point) {
		const [ x, y ] = arrPoint;
		const [ xn, yn ] = Path.NormalizePoint(...point);

		return ~~xn === ~~x && ~~yn === ~~y;
	}

	isDestination(...point) {
		return Path.IsSamePoint(this.destination, ...point);
	}
	isOrigin(...point) {
		return Path.IsSamePoint(this.origin, ...point);
	}
	isInPath(...point) {
		for(let [ px, py ] of this.path) {
			if(Path.IsSamePoint([ px, py ], ...point)) {
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
    
            if(Helper.round(x, Path.Precision) === Helper.round(cx, Path.Precision) && Helper.round(y, Path.Precision) === Helper.round(cy, Path.Precision)) {
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

/**
 * Here @world is the entity World, not the component world, as it needs the Node/Terrain data
 * to appropriately calculate the path.
 */
export function FindPath(world, origin, destination, { algorithm = AStar } = {}) {
    //!GRID-NUDGE
    origin = origin.map(v => ~~v);
    destination = destination.map(v => ~~v);

    const path = algorithm(world, origin, destination);

    if(path.length) {
        return new Path({ origin, destination, path });
    }

    return false;
};

Path.FindPath = FindPath;

export default Path;