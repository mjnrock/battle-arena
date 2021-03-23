import { v4 as uuidv4 } from "uuid";
import EntityManager from "../../manager/EntityManager";

import LayeredCanvas from "./LayeredCanvas";
import RenderLayer from "./RenderLayer";

export class RenderGroup extends LayeredCanvas {
    constructor(game, width, height, layers = [], { tw = 32, th = 32 } = {}) {
        super({ width, height, tw, th });

        this.__id = uuidv4();
        this.__game = game;

        for(let layer of layers) {
            if(layer instanceof RenderLayer) {
                this.addLayer(layer);
            }
        }

        this.drawFrame = () => this.drawLayers();
    }

    setEntityManager(layerKey, entityMgr) {
        const layer = this.stack.get(layerKey);

        if(layer instanceof RenderLayer && (entityMgr instanceof EntityManager || Array.isArray(entityMgr))) {
            layer.entityManager = entityMgr;
        }

        return this;
    }
    setEntityManagers(layerKeys = [], entityMgrs = []) {
        if(layerKeys.length !== entityMgrs.length) {
            return false;
        }

        for(let i = 0; i < layerKeys.length; i++) {
            this.setEntityManager(layerKeys[ i ], entityMgrs[ i ]);
        }

        return this;
    }

    get id() {
        return this.__id;
    }
    get game() {
        return this.__game;
    }
}

export default RenderGroup;