import Point from "./Point";

export class Rectangle extends Point {
    constructor(x, y, w, h) {
        super(x, y);

        this.width = w;
        this.height = h;
    }

    get origin() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
        };
    }

    get xw() {
        return this.x + this.width;
    }
    get yh() {
        return this.y + this.height;
    }

    get area() {
        return this.width * this.height;
    }

    bounds(asObject = true, centered = false) {
        let obj = {};
        if(centered === false) {
            obj = {
                x: this.x,
                y: this.y,
                xw: this.xw,
                yh: this.yh,
            };
        } else {
            obj = {
                x: this.x + (this.width / 2),
                y: this.y + (this.height / 2),
                xw: this.xw,
                yh: this.yh,
                rw: this.width / 2,
                rh: this.height / 2,
            };
        }

        if(asObject === true) {
            return obj;
        }

        return Object.values(obj);
    }

    hasIntersection(x, y) {
        return x >= this.x
            && x <= this.x + this.width
            && y >= this.y
            && y <= this.y + this.height;
    }
}

export function Centered(x, y, rw, rh) {
    return new Rectangle(
        x - rw,
        y - rh,
        rw * 2,
        rh * 2,
    );
};

Rectangle.Centered = Centered;

export default Rectangle;