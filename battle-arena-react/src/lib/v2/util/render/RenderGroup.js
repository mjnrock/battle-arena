import EntityManager from "./../../manager/EntityManager";
import TileCanvas from "./TileCanvas";

export class RenderGroup extends TileCanvas {
    constructor(entities = [], { tw = 32, th = 32 } = {}) {
        super(tw, th);

        if(entities instanceof EntityManager) {
            this.entityManager = entities;
        } else {
            this.entityManager = new EntityManager(entities);
        }

        this.start();
    }

    get entities() {
        return this.entityManager.values;
    }

    //TODO  Image filter/manipulation methods
}

export default RenderGroup;