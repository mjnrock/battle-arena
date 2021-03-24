// import Agency from "@lespantsfancy/agency";

import { hasPosition } from "../data/entity/components/position";
import World from "../World";

export class Portal {
    constructor(world, x, y, { activator } = {}) {
        if(!(world instanceof World)) {
            throw new Error(`Poral must connect to a <World>`);
        }

        this.world = world;
        this.x = x;
        this.y = y;

        this.__activator = activator;
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

    activate(worldManager, entity) {
        if(hasPosition(entity) && this.activator(entity) === true) {
            worldManager.migrate(entity, this.world, this.x, this.y);

            return true;
        }

        return false;
    }
};

export default Portal;