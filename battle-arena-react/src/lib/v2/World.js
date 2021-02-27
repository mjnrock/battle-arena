import Agency from "@lespantsfancy/agency";

import Registry from "./Registry";

export class World extends Agency.Observable {
    constructor(width, height) {
        super();

        this.width = width;
        this.height = height;

        this.entities = new Registry();
        this.terrain = new Agency.Context({
            rules: {
                "*": (nv, v, { prop, target }) => {
                    return true;
                    // return nv instanceof Terrain;
                }
            }
        });
    }

    join(entity, ...synonyms) {
        this.entities.register(entity, ...synonyms);
    }
    leave(entity) {
        this.entities.unregister(entity);
    }
}

export default World;