import Canvas from "./Canvas";
import GridCanvas from "./GridCanvas";

export default class LayeredCanvas extends GridCanvas {
    constructor({ canvas, tw = 1, th = 1, width, height } = {}) {
        super(tw, th, { canvas, width, height });

        this.stack = new Map();
    }
    
    getLayer(key = 0) {
        return this.stack.get(key);
    }
    addLayer(value) {
        const key = this.stack.size;
        if(value instanceof Canvas) {
            this.stack.set(key, value);
        } else if(value instanceof HTMLCanvasElement) {
            this.stack.set(key, new Canvas(value));
        }

        return this;
    }
    removeLayer(key) {
        this.stack.delete(key);

        return this;
    }

    swapLayers(key1, key2) {
        const temp = this.stack.get(key1);

        this.stack.set(key1, this.stack.get(key2));
        this.stack.set(key2, temp);

        return this;
    }

    drawLayer(key = 0, ...drawImageArgs) {
        const layer = this.getLayer(key);

        if(layer) {
            if(!drawImageArgs.length) {
                drawImageArgs = [ 0, 0 ];
            }

            this.ctx.drawImage(layer.canvas, ...drawImageArgs);
        }

        return this;
    }
    drawLayers(...drawImageArgs) {
        if(!drawImageArgs.length) {
            drawImageArgs = [ 0, 0 ];
        }
        
        this.stack.forEach(ccanvas => this.ctx.drawImage(ccanvas.canvas, ...drawImageArgs));

        return this;
    }
}