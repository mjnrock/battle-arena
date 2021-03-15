import TileCanvas from "./TileCanvas";

export class RenderLayer extends TileCanvas {
    constructor(group, { tw = 1, th = 1 } = {}) {
        super(tw, th);

        this._group = group;
        this.registry = {};
    }
}

export default RenderLayer;