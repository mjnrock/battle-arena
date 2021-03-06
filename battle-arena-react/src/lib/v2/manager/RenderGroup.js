import EntityManager from "./EntityManager";
import ImageRegistry from "./ImageRegistry";

export class RenderGroup {
    constructor(entities = [], dimensions, { spriteCoords = [], lookupFns = [] } = {}) {
        if(entities instanceof EntityManager) {
            this.entityManager = entities;
        } else {
            this.entityManager = new EntityManager(entities);
        }

        if(dimensions instanceof ImageRegistry) {
            this.imageRegistry = dimensions;
        } else {
            this.imageRegistry = new ImageRegistry(dimensions, { spriteCoords, lookupFns });
        }
    }

    image(...coords) {
        return this.imageRegistry.get(...coords);
    }

    //TODO  Image filter/manipulation methods
}

export default RenderGroup;