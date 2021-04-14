import Circle from "./Circle";

export class PointCircle extends Circle {
    constructor(x, y, r) {
        super(x, y, r);

        this.radius = Math.round(parseFloat(r));
    }

    getPerimeterPoints() {
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

export function GetPerimeterPoints(x, y, r) {
    let tc;
    if(x instanceof Circle) {
        tc = new PointCircle(x.x, x.y, x.radius);
    } else {
        tc = new PointCircle(x, y, r);
    }

    return tc.getPerimeterPoints();
}

PointCircle.GetPerimeterPoints = GetPerimeterPoints;

export default PointCircle;



//! This doesn't make a nice looking circle for many radii, really more of a rounded-edge square
//!     but kept here as a working point forward, or a quick solution, when needed
// function getAllCirclePoints(xc, yc, r) {
//     const points = [];
//     for(let x = xc - r; x <= xc; x++) {
//         for(let y = yc - r; y <= yc; y++) {
//             if((x - xc) * (x - xc) + (y - yc) * (y - yc) <= r * r) {
//                 let xSym = xc - (x - xc);
//                 let ySym = yc - (y - yc);
                
//                 points.push([ x, y ]);
//                 points.push([ x, ySym ]);
//                 points.push([ xSym, y ]);
//                 points.push([ xSym, ySym ]);
//             }
//         }
//     }

//     points.forEach(([ x, y ]) => {
//         game.render.prop({ fillStyle: "rgba(255, 255, 0, 0.25)" }).tPoint(x, y);
//     })
// }
// getAllCirclePoints(5, 5, 5);