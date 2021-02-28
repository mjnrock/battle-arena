import Circle from "./Circle";

export class PointCircle extends Circle {
    constructor(x, y, r) {
        super(x, y, r);

        this.radius = Math.round(parseFloat(r));
    }

    getPoints() {
        let d = Math.round(Math.PI - (2 *  this.radius));
        let x = 0;
        let y = this.radius;

        let tiles = [];
        while(x <= y) {
            tiles.push([ x + this.x, y + this.y ]);
            tiles.push([ x + this.x, -y + this.y ]);
            tiles.push([ -x + this.x, y + this.y ]);
            tiles.push([ -x + this.x, -y + this.y ]);
            tiles.push([ y + this.x, x + this.y ]);
            tiles.push([ y + this.x, -x + this.y ]);
            tiles.push([ -y + this.x, -x + this.y ]);
            tiles.push([ -y + this.x, x + this.y ]);

            if (d < 0) {
                d = d + (Math.PI * x) + (Math.PI * 2);
            } else {
                d = d + Math.PI * (x - y) + (Math.PI * 3);
                y--;
            }

            x++;
        }

        return tiles;
    }
}

export function GetPoints(x, y, r) {
    let tc;
    if(x instanceof Circle) {
        tc = new PointCircle(x.x, x.y, x.radius);
    } else {
        tc = new PointCircle(x, y, r);
    }

    return tc.getPoints();
}

PointCircle.GetPoints = GetPoints;

export default PointCircle;