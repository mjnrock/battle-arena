import EntityManager from "./EntityManager";
import ImageRegistry from "./ImageRegistry";

export class RenderGroup {
    constructor(entities = [], base64s = [], { imageRegistryCallback, lookupFns = [] } = {}) {
        if(entities instanceof EntityManager) {
            this.entityManager = entities;
        } else {
            this.entityManager = new EntityManager(entities);
        }

        if(base64s instanceof ImageRegistry) {
            this.imageRegistry = base64s;
        } else {
            this.imageRegistry = new ImageRegistry(base64s, { callback: imageRegistryCallback, lookupFns });
        }
    }

    image(...coords) {
        return this.imageRegistry.get(...coords);
    }

    //TODO  Image filter/manipulation methods
}

export default RenderGroup;