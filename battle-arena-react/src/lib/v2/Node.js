import Emitter from "./util/agency/Emitter";

export class Node extends Emitter {
    constructor(x, y, terrain, { portals = [], occupants = [], frequency = 0, value = 0 } = {}) {
        super([
            "join",
            "leave",
            "portal",
        ]);

        this._x = x;
        this._y = y;
        this._terrain = terrain;
        
        this._portals = new Set(portals);
        this._occupants = new Set(occupants);

        this._frequency = frequency;
        this._value = value;
    }

    join(entity) {
        this._occupants.add(entity);
        ++this._frequency;

        this.$join(entity);

        return this;
    }
    leave(entity) {
        this._occupants.delete(entity);

        this.$leave(entity);

        return this;
    }
};

export default Node;