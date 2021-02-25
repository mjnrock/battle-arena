import Canvas from "./Canvas";

export default class GridCanvas extends Canvas {
    constructor(tw, th, { canvas, width, height, props } = {}) {
        super({ canvas, width, height, props });

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

    drawGrid({ fillStyle = "#000", isFilled = false } = {}) {
        this.ctx.save();
        this.prop({ fillStyle });

        for(let x = 0; x < this.rows; x++) {
            for(let y = 0; y < this.cols; y++) {
                this.gRect(
                    x,
                    y,
                    1,
                    1,
                    { isFilled }
                )
            }
        }
        this.ctx.restore();

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
    gErase(tx, ty, tw, th) {
        this.erase(tx * this.tw, ty * this.th, tw * this.tw, th * this.th);

        return this;
    }

    gPoint(tx, ty) {
        return this.gRect(tx, ty, 1, 1, { isFilled: true });
    }
    gRect(tx, ty, tw, th, { isFilled = false } = {}) {
        this.rect(tx * this.tw, ty * this.th, tw * this.tw, th * this.th, { isFilled });

        return this;
    }
    gCircle(tx, ty, r, { isFilled = false } = {}) {
        this.circle(tx * this.tw, ty * this.th, r, { isFilled });

        return this;
    }

    gQuilt(tx, ty, tw, th, { colorFn } = {}) {
        this.ctx.save();
        for(let i = 0; i < tw; i++) {
            for(let j = 0; j < th; j++) {
                let color;

                if(typeof colorFn === "function") {
                    color = colorFn({ x: (tx + i) * this.tw, y: (ty + j) * this.th, i, j }, { tx, ty, tw, th, width: this.tw, height: this.tile.hei });
                } else {
                    color = `rgb(${ ~~(Math.random() * 255) }, ${ ~~(Math.random() * 255) }, ${ ~~(Math.random() * 255) })`;
                }

                this.prop({
                    fillStyle: color,
                });

                this.gPoint(tx + i, ty + j);
            }
        }
        this.ctx.restore();

        return this;
    }

    pointToLocal(px, py, { asArray = false } = {}) {
        const rect = this.canvas.getBoundingClientRect();
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
            return [ tx, ty, Math.floor(tx), Math.floor(ty), x, y ];
        }

        return {
            tx,
            ty,
            txi: Math.floor(tx),
            tyi: Math.floor(ty),
            x,
            y,
        };
    }
}