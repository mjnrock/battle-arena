/**
 * @bubbler will send the event emission to the <NodeManager> instead of
 *      firing directly from here.  Because of the <Emitter> injection
 *      to <Agency..Network>, in a 25x25 map, this frees 624 subscriptions.
 */
export class Node {
    constructor(coords = [], { terrain, portals = [], occupants = [], frequency = 0, value = 0, clearance = Infinity, bubbler } = {}) {
        this._coords = coords;
        this._terrain = terrain;
        
        this._portals = new Set(portals);
        this._occupants = new Set(occupants);

        this._frequency = frequency;
        this._value = value;
        this._clearance = clearance;

        this._bubbler = bubbler;
    }

    __destroy(destroyTerrain = true) {
        if(destroyTerrain) {
            this._terrain.__destroy();
        }

        this._occupants = new Set();
        
        for(let key in this) {
            delete this[ key ];
        }

        this.__deconstructor();
    }

    get coords() {
        return this._coords;
    }
    get x() {
        return this._coords[ 0 ];
    }
    get y() {
        return this._coords[ 1 ];
    }
    get z() {
        return this._coords[ 2 ];
    }
    get w() {
        return this._coords[ 3 ];
    }
    
    get bubbler() {
        return this._bubbler;
    }

    get terrain() {
        return this._terrain;
    }
    get portals() {
        return this._portals;
    }
    get occupants() {
        return this._occupants;
    }
    
    get frequency() {
        return this._frequency;
    }
    get value() {
        return this._value;
    }
    get clearance() {
        return this._clearance;
    }

    get hasPortals() {
        return this._portals.size > 0;
    }

    get cost() {
        return this._terrain.terrain.cost;
        // return this._terrain.terrain.cost + (this._occupants.size ? Infinity : 0);
    }
    get pathInfo() {
        return {
            x: this.x,
            y: this.y,
            cost: this.cost,
        };
    }
    
    pos(asObject = true) {
        if(asObject) {
            return {
                x: this.x,
                y: this.y,
            };
        }

        return [ this.x, this.y ];
    }
    
    portal(entity) {
        for(let portal of this.portals) {
            if(portal.activate(entity)) {
                this.bubbler("portal", portal, entity);

                return true;
            }
        }

        return false;
    }

    join(entity) {
        const size = this._occupants.size;
        
        this._occupants.add(entity);

        if(this._occupants.size >= size) {
            ++this._frequency;

            this.portal(entity)

            // this.bubbler("join", this, entity);

            return true;
        }

        return false;
    }
    leave(entity) {
        if(this._occupants.delete(entity)) {
            // this.bubbler("leave", this, entity);

            return true;
        }

        return false;
    }

    clearOccupants() {
        this._occupants = new Set();

        return this;
    }

    has(entity) {
        return this._occupants.has(entity);
    }
    get hasOccupants() {
        return this._occupants.size > 0;
    }
};

export default Node;