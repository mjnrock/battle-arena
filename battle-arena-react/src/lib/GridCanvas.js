import Canvas from "./Canvas";

export default class GridCanvas extends Canvas {
    constructor(tw, th, { canvas, width, height } = {}) {
        super({ canvas, width, height });

        this.tile = {
            width: tw,
            height: th,
        };
    }

    get tw() {
        return this.tile.width;
    }
    get th() {
        return this.tile.height;
    }

    get rows() {
        return this.canvas.width / this.tw;
    }
    get cols() {
        return this.canvas.height / this.th;
    }

    resizeTile(tw, th) {
        if(Number.isInteger(tw) && Number.isInteger(th)) {
            this.tile = {
                width: tw,
                height: th,
            };
        }

        return this;
    }

    /**
     * 
     * @param {string|number} round "floor"|"ceil"|/[0-9]/
     */
    pixelToGrid(xs = [], ys = [], { round = 0, asArray = false } = {}) {
        if(String(round).match(/[0-9]/)) {
            xs = xs.map(x => parseFloat(x).toFixed(round));
            ys = ys.map(y => parseFloat(y).toFixed(round));
        } else if(round in Math) {
            xs = xs.map(x => Math[ round ](x));
            ys = ys.map(y => Math[ round ](y));
        }
        
        const tx = xs.map(x => this.tw * x);
        const ty = ys.map(y => this.th * y);

        if(asArray === true) {
            return [
                tx,
                ty
            ];
        }

        return {
            x: tx,
            y: ty,
        };
    }

    drawGrid({ fillStyle = "#000" } = {}) {
        this.prop({ fillStyle });

        for(let x = 0; x < this.rows; x++) {
            for(let y = 0; y < this.cols; y++) {
                this.gRect(
                    x,
                    y,
                    1,
                    1,
                    { isFilled: false }
                )
            }
        }

        return this;
    }
    drawTransparency() {    
        let iter = 0;
        for (let x = 0; x < this.canvas.width; x += this.tw / 2) {
            for (let y = 0; y < this.canvas.height; y += this.th / 2) {
                this.ctx.fillStyle = (iter % 2 === 0) ? "#fcfcfc" : "#f5f5f5";
                this.ctx.fillRect(x, y, this.tw, this.th);
                ++iter;
            }
            ++iter;
        }

        return this;
    }
    
    //* Grid ("g") Shape Methods
    /*
     *  All ctx modifications (e.g. color, stroke width, etc.) should be changed via .prop
     */
    gErase(x, y, w, h, { round = 0 } = {}) {
        const [[ tx, tw ], [ ty, th ]] = this.pixelToGrid([ x, w ], [ y, h ], { round, asArray: true });

        this.erase(tx, ty, tw, th);

        return this;
    }

    gPoint(x, y, { round } = {}) {
        return this.gRect(x, y, 1, 1, { isFilled: true, round });
    }
    gRect(x, y, w, h, { isFilled = false, round } = {}) {
        const [[ tx, tw ], [ ty, th ]] = this.pixelToGrid([ x, w ], [ y, h ], { round, asArray: true });

        this.rect(tx, ty, tw, th, { isFilled });

        return this;
    }
    gCircle(x, y, r, { isFilled = false, round } = {}) {
        const [[ tx ], [ ty ]] = this.pixelToGrid([ x ], [ y ], { round, asArray: true });
        
        this.circle(tx, ty, r, { isFilled });

        return this;
    }

    gTile(imageOrSrc, sx, sy, dx, dy, { round } = {}) {
        const [[ tsx, tdx ], [ tsy, tdy ]] = this.pixelToGrid([ sx, dx ], [ sy, dy ], { round, asArray: true });

        this.image(imageOrSrc, tsx, tsy, this.tw, this.th, tdx, tdy, this.tw, this.th);

        return this;
    }

    gQuilt(x, y, w, h, { colorFn } = {}) {
        this.ctx.save();
        for(let i = 0; i < w; i++) {
            for(let j = 0; j < h; j++) {
                let color;

                if(typeof colorFn === "function") {
                    color = colorFn({ x: x + i, y: y + j, i, j }, { tx: x, ty: y, w, h });
                } else {
                    color = `rgb(${ ~~(Math.random() * 255) }, ${ ~~(Math.random() * 255) }, ${ ~~(Math.random() * 255) })`;
                }

                this.prop({
                    fillStyle: color,
                });

                this.gPoint(x + i, y + j);
            }
        }
        this.ctx.restore();

        return this;
    }

    pointToLocal(px, py, { asArray = false } = {}) {
        const rect = canvas.getBoundingClientRect();
        const x = px - rect.left;
        const y = py - rect.top;
        
        if(asArray === true) {
            return [ x, y ];
        }

        return { x, y };
    }
    pointToTile(px, py, { localize = true, asArray = false } = {}) {
        const { x, y } = localize === true ? this.pointToLocal(px, py) : { x: px, y: py };

        const tx = x / this.tw;
        const ty = y / this.th;
        if(asArray === true) {
            return [ tx, ty, Math.floor(tx), Math.floor(ty) ];
        }

        return {
            tx,
            ty,
            txi: Math.floor(tx),
            tyi: Math.floor(ty),
        };
    }
}