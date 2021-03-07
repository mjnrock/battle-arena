import EntityManager from "./../../manager/EntityManager";
import TileCanvas from "./TileCanvas";
import ImageRegistry from "./ImageRegistry";

export class RenderGroup extends TileCanvas {
    constructor(entities = [], dimensions, { tw = 32, th = 32, spriteCoords = [], lookupFns = [] } = {}) {
        super(tw, th);

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

        this.start();
    }

    get entities() {
        return this.entityManager.values;
    }
    sprite(...coords) {
        return this.imageRegistry.get(...coords);
    }

    //TODO  Image filter/manipulation methods
}

export default RenderGroup;