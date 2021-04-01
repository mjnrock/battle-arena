// import Agency from "@lespantsfancy/agency";

import Animator from "./Animator";

export default class Canvas {
    constructor({ canvas, width = 300, height = 150, drawAnimationFrame, props = {} } = {}) {
        this.config = {
            normalization: {
                arc: -Math.PI / 4,
            }
        };
        
        this._canvas = canvas || document.createElement("canvas");
        if(canvas) {
            width = canvas.width;
            height = canvas.height;
        } else {
            this._canvas.width = width;
            this._canvas.height = height;
        }

        this.prop(props);

        this.animator = new Animator(this);
        this.drawAnimationFrame = typeof drawAnimationFrame === "function" ? drawAnimationFrame : () => {};
    }

    get canvas() {
        return this._canvas;
    }
    set canvas(canvas) {
        return Reflect.set(this, "_canvas", canvas);
    }
    get ctx() {
        return this._canvas.getContext("2d");
    }
    
    get width() {
        return this._canvas.width;
    }
    set width(value) {
        return Reflect.set(this._canvas, "width", value);
    }
    
    get height() {
        return this._canvas.height;
    }
    set height(value) {
        return Reflect.set(this._canvas, "height", value);
    }
    
    resize(width, height) {
        if(Number.isInteger(width) && Number.isInteger(height)) {
            this._canvas.width = width;
            this._canvas.height = height;
        }

        return this;
    }
    
    get center() {
        return [
            this.width / 2,
            this.height / 2
        ];
    }

    prop(obj = {}) {
        for(let [ key, value ] of Object.entries(obj)) {
            this.ctx[ key ] = value;
        }

        return this;
    }

    //* Erasure methods
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        return this;
    }
    erase(x, y, w, h) {
        this.ctx.clearRect(x, y, w, h);

        return this;
    }
    eraseNgon(n, x, y, r, { rotation = 0 } = {}) {
        let pColor = this.ctx.strokeStyle;
        let pBgColor = this.ctx.fillStyle;

        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.fillStyle = "#fff";
        this.ngon(n, x, y, r, { rotation, isFilled: true });

        // Reset the composite and revert color
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.strokeStyle = pColor;
        this.ctx.fillStyle = pBgColor;
    }

    degToRad(...degrees) {
        if(degrees.length > 1) {
            const arr = [];

            for(let deg of degrees) {
                arr.push((deg * Math.PI / 180) + this.config.normalization.arc);
            }

            return arr;
        }

        return (degrees[ 0 ] * Math.PI / 180) + this.config.normalization.arc;
    }
    radToDeg(...radians) {
        if(radians.length > 1) {
            const arr = [];

            for(let rad of radians) {
                arr.push((rad + this.config.normalization.arc) * 180 / Math.PI);
            }

            return arr;
        }

        return (radians[ 0 ] + this.config.normalization.arc) * 180 / Math.PI;
    }

    //* Shape methods
    arc(x, y, radius, startAngle = 0, endAngle = Math.PI * 2, { isFilled = false } = {}) {
        if(isFilled) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, startAngle + this.config.normalization.arc, endAngle + this.config.normalization.arc);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, startAngle + this.config.normalization.arc, endAngle + this.config.normalization.arc);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        return this;
    }

    /**
     * Starts the arc "north", by adding -Math.PI / 2 to @start
     * @counterClockwise self-explanatory, but toggling will quickly invert the shape
     */
    pie(x, y, radius, startRadian, endRadian, { isFilled = false, alignment = -Math.PI / 2, counterClockwise = false } = {}) {
        let dx = radius * Math.cos(alignment),
            dy = radius * Math.sin(alignment);

        if(isFilled) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + dx, y + dy); // This would change if "north" is not the starting point
            this.ctx.arc(x, y, radius, startRadian + alignment, endRadian + alignment, counterClockwise);
            this.ctx.lineTo(x, y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + dx, y + dy);
            this.ctx.arc(x, y, radius, startRadian + alignment, endRadian + alignment, counterClockwise);
            this.ctx.lineTo(x, y);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        return this;
    }

    circle(x, y, radius, { isFilled = false } = {}) {
        if(isFilled) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        return this;
    }

    point(x, y) {
        return this.rect(x, y, 1, 1);
    }

    line(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.closePath();
        this.ctx.stroke();

        return this;
    }

    rect(x, y, width, height, { isFilled = false } = {}) {
        this.ctx.beginPath();
        if(isFilled) {
            this.ctx.fillRect(x, y, width, height);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            this.ctx.rect(x, y, width, height);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        return this;
    }

    square(x, y, { rc = null, rw = null, isFilled = false } = {}) {
        if(rc !== null) {
            this.rect(x, y, 2 * rc * Math.cos(Math.PI / 4), 2 * rc * Math.sin(Math.PI / 4), { isFilled });
        } else if(rw !== null) {
            this.rect(x, y, 2 * rw, 2 * rw, { isFilled });
        }

        return this;
    }

    _getNgonCorner(x, y, r, i, v, rot = 0) {
        let deg = (360 / v) * i + rot;
        let rad = (Math.PI / 180) * deg;

        return [
            x + r * Math.cos(rad),
            y + r * Math.sin(rad),
        ];
    }
    ngon(n, x, y, radius, { isFilled = false, rotation = 0 } = {}) {
        let corners = [];
        for (let i = 0; i < n; i++) {
            corners.push(this._getNgonCorner(x, y, radius, i, n, rotation));
        }

        this.ctx.beginPath();
        this.ctx.moveTo(...corners[ 0 ]);
        corners.forEach((c, i) => {
            if(i < corners.length - 1) {
                this.ctx.lineTo(...corners[i + 1]);
            }
        });
        this.ctx.lineTo(...corners[ 0 ]);
        this.ctx.closePath();

        if(isFilled) {
            // this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            this.ctx.stroke();
        }

        return this;
    }

    triangle(p1 = [], p2 = [], p3 = []) {
        if(arguments.length === 6) {
            p1 = [ arguments[ 0 ], arguments[ 1 ] ];
            p2 = [ arguments[ 2 ], arguments[ 3 ] ];
            p3 = [ arguments[ 4 ], arguments[ 5 ] ];
        }

        this.line(...p1, ...p2);
        this.line(...p2, ...p3);
        this.line(...p3, ...p1);

        return this;
    }

    text(txt, x, y, { align = "center", color = "#000", font = "10pt mono" } = {}) {
        let xn = x,
            yn = y;

        if(align) {
            this.ctx.textAlign = align;
            this.ctx.textBaseline = "middle";
        }

        let pColor = this.ctx.fillStyle;
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.fillText(txt, xn, yn);
        this.ctx.fillStyle = pColor;

        return this;
    }

    image(imageOrSrc, ...args) {
        return new Promise((resolve, reject) => {
            if(imageOrSrc instanceof HTMLImageElement || imageOrSrc instanceof HTMLCanvasElement) {
                // Synchronously draw if <img> or <canvas>
                this.ctx.drawImage(imageOrSrc, ...args);

                resolve(this);
            } else if(typeof imageOrSrc === "string" || imageOrSrc instanceof String) {
                // Asynchronously draw if @imageOrSrc is a "src" string
                let img = new Image();
                img.onload = e => {
                    this.ctx.drawImage(img, ...args);

                    resolve(this);
                }
                img.src = imageOrSrc;
            } else {
                reject(this);
            }

            return this;
        });
    }

    tile(imageOrSrc, size, sx, sy, dx, dy) {
        this.image(imageOrSrc, sx, sy, size, size, dx, dy, size, size);

        return this;
    }

    save() {
        this.ctx.save();

        return this;
    }
    restore() {
        this.ctx.restore();

        return this;
    }
};