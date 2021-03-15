import EntityManager from "./../../manager/EntityManager";
import RenderLayer from "./RenderLayer";
import TileCanvas from "./TileCanvas";

export class RenderGroup extends TileCanvas {
    constructor(entities = [], { tw = 32, th = 32 } = {}) {
        super(tw, th);

        if(entities instanceof EntityManager) {
            this.entityMgr = entities;
        } else {
            this.entityMgr = new EntityManager(entities);
        }

        this.layers = [];

        this.start();
    }

    addLayer() {
        this.layers.push(new RenderLayer(this.entityMgr));
    }

    get entities() {
        return this.entityMgr.values;
    }

    //TODO  Image filter/manipulation methods
}

export default RenderGroup;