import LayeredCanvas from "./LayeredCanvas";

export class RenderGroup extends LayeredCanvas {
    constructor({ tw = 32, th = 32 } = {}) {
        super({ tw, th });
    }
}

export default RenderGroup;