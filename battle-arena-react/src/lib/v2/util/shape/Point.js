import Agency from "@lespantsfancy/agency";

export class Point extends Agency.Watchable {
    constructor(x, y) {
        super({
            x,
            y,
        });
    }

    get origin() {
        return {
            x: this.x,
            y: this.y,
        };
    }
}

export default Point;