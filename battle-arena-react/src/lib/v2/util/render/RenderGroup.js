import { v4 as uuidv4 } from "uuid";

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

        this.drawLayers();
    }

    get id() {
        return this.__id;
    }
    get game() {
        return this.__game;
    }
}

export default RenderGroup;