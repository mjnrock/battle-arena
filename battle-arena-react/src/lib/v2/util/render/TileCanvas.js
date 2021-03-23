import Canvas from "./Canvas";

export default class TileCanvas extends Canvas {
    constructor(tw, th, { canvas, width, height, props, onDraw } = {}) {
        super({ canvas, width, height, props, onDraw });

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
        return this.canvas.height / this.th;
    }
    get cols() {
        return this.canvas.width / this.tw;
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

        for(let x = 0; x < this.cols; x++) {
            for(let y = 0; y < this.rows; y++) {
                this.tRect(
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
    tErase(tx, ty, tw, th) {
        this.erase(tx * this.tw, ty * this.th, tw * this.tw, th * this.th);

        return this;
    }

    tPoint(tx, ty) {
        return this.tRect(tx, ty, 1, 1, { isFilled: true });
    }
    tRect(tx, ty, tw, th, { isFilled = false } = {}) {
        this.rect(tx * this.tw, ty * this.th, tw * this.tw, th * this.th, { isFilled });

        return this;
    }
    /**
     * IMPORTANT:  TileCanvas MUST have *square* tiles for this work (i.e. tw = th)
     * This is sort of half-assed, in that it uses an array of tiles
     *  via the midpoint circle algorithm for the perimeter and, if passed,
     *  an actual circle as the "inner circle".  As such, using transparent
     *  colors will result in blending.
     * 
     * Radius Calculation:
     *      Math.floor(@tr * ((this.tw + this.th) / 2))
     */
    tCircle(tx, ty, tr, { isFilled = false } = {}) {
        let d = Math.round(Math.PI - (2 *  tr));
        let x = 0;
        let y = tr;

        let tiles = [];
        while(x <= y) {
            tiles.push([ x + tx, y + ty ]);
            tiles.push([ x + tx, -y + ty ]);
            tiles.push([ -x + tx, y + ty ]);
            tiles.push([ -x + tx, -y + ty ]);
            tiles.push([ y + tx, x + ty ]);
            tiles.push([ y + tx, -x + ty ]);
            tiles.push([ -y + tx, -x + ty ]);
            tiles.push([ -y + tx, x + ty ]);

            if (d < 0) {
                d = d + (Math.PI * x) + (Math.PI * 2);
            } else {
                d = d + Math.PI * (x - y) + (Math.PI * 3);
                y--;
            }

            x++;
        }

        this.save();
            this.prop({ fillStyle: this.ctx.strokeStyle });
            tiles.forEach(([ tx, ty ]) => this.tPoint(tx, ty));
        this.restore();

        if(isFilled) {
            this.save();
                this.prop({ strokeStyle: "transparent" });
                this.circle((tx + 0.5) * this.tw, (ty + 0.5) * this.th, tr * this.tw, { isFilled });
            this.restore();
        }

        return this;
    }

    tQuilt(tx, ty, tw, th, { colorFn } = {}) {
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

                this.tPoint(tx + i, ty + j);
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