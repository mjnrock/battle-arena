import Canvas from "./Canvas";
import TileCanvas from "./TileCanvas";

export default class LayeredCanvas extends TileCanvas {
    constructor({ canvas, tw = 1, th = 1, width, height, props } = {}) {
        super(tw, th, { canvas, width, height, props });

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

    startAll() {
        this.stack.forEach(ccanvas => ccanvas.start());

        return this;
    }
    stopAll() {
        this.stack.forEach(ccanvas => ccanvas.stop());

        return this;
    }

    removeAllLayers() {
        this.stack = new Map();
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
        
        this.stack.forEach(ccanvas => {
            if(ccanvas instanceof LayeredCanvas) {
                ccanvas.drawLayers(...drawImageArgs);
            }

            this.ctx.drawImage(ccanvas.canvas, ...drawImageArgs);
        });

        return this;
    }
}