import Struct from "../../@agency/core/ecs/Struct";

export class Point extends Struct {
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