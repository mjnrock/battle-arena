import Agency from "@lespantsfancy/agency";

export class Point extends Agency.Observable {
    constructor(x, y) {
        super(false);

        this.x = x;
        this.y = y;
    }

    get origin() {
        return {
            x: this.x,
            y: this.y,
        };
    }
}

export default Point;