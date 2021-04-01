import Agency from "@lespantsfancy/agency";

export class Node extends Agency.Event.Emitter {
    static Events = [
        "join",
        "leave",
        "portal",
    ];

    constructor(coords = [], terrain, { portals = [], occupants = [], frequency = 0, value = 0, clearance = Infinity } = {}) {
        super();

        this._coords = coords;
        this._terrain = terrain;
        
        this._portals = new Set(portals);
        this._occupants = new Set(occupants);

        this._frequency = frequency;
        this._value = value;
        this._clearance = clearance;
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
    
    get terrain() {
        return this._terrain;
    }
    get portals() {
        return this._portals;
    }
    get occupants() {
        return this._occupants;
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
                this.$.emit("portal", portal, entity);
            }
        }

        return this;
    }

    join(entity) {
        const size = this._occupants.size;
        
        this._occupants.add(entity);

        if(this._occupants.size >= size) {
            // ++this._frequency;

            this.$.emit("join", this, entity);

            this.portal(entity);

            return true;
        }

        return false;
    }
    leave(entity) {
        if(this._occupants.delete(entity)) {
            this.$.emit("leave", this, entity);

            return true;
        }

        return false;
    }
};

export default Node;