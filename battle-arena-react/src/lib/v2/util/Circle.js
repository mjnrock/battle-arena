import Point from "./Point";

export class Circle extends Point {
    constructor(x, y, r) {
        super(x, y);

        this.radius = r;
    }

    hasIntersection(x, y) {
        return (x - this.x) ** 2 + (y - this.y) ** 2 <= this.radius ** 2;
    }
}

// export function GetPoints(x, y, r) {
//     const tc = new PointCircle(x, y, r);

//     return tc.getPoints(); 
// }

// PointCircle.GetPoints = GetPoints;

export default Circle;