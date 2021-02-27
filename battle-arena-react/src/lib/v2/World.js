import Agency from "@lespantsfancy/agency";

export class World extends Agency.Observable {
    constructor() {
        super();

        this.entities = new Agency.Registry();
        this.terrain = new Agency.Context({
            rules: {
                "*": (nv, v, { prop, target }) => {
                    return true;
                    // return nv instanceof Terrain;
                }
            }
        });
    }

    join(entity) {
        this.entities.register(entity);
    }
    leave(entity) {
        this.entities.unregister(entity);
    }
}

export default World;