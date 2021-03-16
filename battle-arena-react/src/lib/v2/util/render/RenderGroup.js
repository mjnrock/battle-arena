import LayeredCanvas from "./LayeredCanvas";
import RenderLayer from "./RenderLayer";

export class RenderGroup extends LayeredCanvas {
    constructor(width, height, layers = [], { tw = 32, th = 32 } = {}) {
        super({ width, height, tw, th });

        for(let layer of layers) {
            if(layer instanceof RenderLayer) {
                this.addLayer(layer);
            }
        }

        this.drawLayers();
    }
}

export default RenderGroup;