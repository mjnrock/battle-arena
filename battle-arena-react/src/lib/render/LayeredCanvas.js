import Canvas from "./Canvas";
import TileCanvas from "./TileCanvas";

export default class LayeredCanvas extends TileCanvas {
    constructor({ canvas, tw = 1, th = 1, width, height, props, drawAnimationFrame } = {}) {
        super(tw, th, { canvas, width, height, props, drawAnimationFrame });

        this.stack = new Map();
    }
    
    getLayer(key = 0) {
        return this.stack.get(key);
    }
    addLayer(...layers) {
        for(let layer of layers) {
            const key = this.stack.size;
            if(layer instanceof Canvas) {
                this.stack.set(key, layer);
            } else if(layer instanceof HTMLCanvasElement) {
                this.stack.set(key, new Canvas(layer));
            }
        }

        return this;
    }
    removeLayer(key) {
        this.stack.delete(key);

        return this;
    }

    startAll() {
        this.start();
        this.stack.forEach(ccanvas => {
            if(ccanvas instanceof LayeredCanvas) {
                ccanvas.startAll();
            } else {
                ccanvas.start();
            }
        });

        return this;
    }
    stopAll() {
        this.stop();
        this.stack.forEach(ccanvas => {
            if(ccanvas instanceof LayeredCanvas) {
                ccanvas.stopAll();
            } else {
                ccanvas.stop();
            }
        });

        return this;
    }

    removeAllLayers() {
        this.stack = new Map();

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
        
        this.stack.forEach(ccanvas => {
            if(ccanvas instanceof LayeredCanvas) {
                ccanvas.drawLayers(...drawImageArgs);
            }

            this.ctx.drawImage(ccanvas.canvas, ...drawImageArgs);
        });

        return this;
    }

    drawAnimationLayers(dt, elapsed, ...drawImageArgs) {
        if(!drawImageArgs.length) {
            drawImageArgs = [ 0, 0 ];
        }
        
        if(this.config.clearBeforeDraw) {
            this.clear();
        }
        
        this.stack.forEach(ccanvas => {
            if(ccanvas instanceof LayeredCanvas) {
                ccanvas.drawAnimationLayers(dt, elapsed, ...drawImageArgs);
            } else {
                ccanvas.drawAnimationFrame(dt, elapsed, ...drawImageArgs);
            }

            this.ctx.drawImage(ccanvas.canvas, ...drawImageArgs);
        });

        return this;
    }
}