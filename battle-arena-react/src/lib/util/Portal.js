import World from "./../world/World";

export class Portal {
    constructor(world, { x, y, activator } = {}) {
        if(!(world instanceof World)) {
            throw new Error(`Poral must connect to a <World>`);
        }

        this.world = world;
        this._x = x;
        this._y = y;

        if(this._x === void 0 && this._y === void 0) {
            this._x = this.x;
            this._y = this.y;
        }

        this.__activator = activator;
    }

    get x() {
        if(typeof this._x === "number") {
            return this._x;
        }

        return this.world.config.spawn[ 0 ];
    }
    get y() {
        if(typeof this._y === "number") {
            return this._y;
        }

        return this.world.config.spawn[ 1 ];
    }
    get pos() {
        if(typeof this._x === "number" && typeof this._y === "number") {
            return [ this._x, this._y ];
        }

        return this.world.config.spawn;
    }

    get activator() {
        // if(typeof this.__activator === "function" || this.__activator instanceof Agency.Proposition) {
        if(typeof this.__activator === "function") {
            return this.__activator;
        }

        return () => true;
    }
    set activator(input) {
        // if(typeof this.__activator === "function" || this.__activator instanceof Agency.Proposition) {
        if(typeof this.__activator === "function") {
            this.__activator = input;
        }
    }

    activate(entity) {
        return this.activator(entity);
    }
};

export default Portal;