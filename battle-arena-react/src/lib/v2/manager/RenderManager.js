import RenderGroup from "../util/render/RenderGroup";

import LayeredCanvas from "./../util/render/LayeredCanvas";

export class RenderManager extends LayeredCanvas {
    constructor(width, height, groups = []) {
        super({ width, height });

        for(let group of groups) {
            this.addGroup(group);
        }
    }

    addGroup(group) {
        if(group instanceof RenderGroup) {
            this.addLayer(group);
        }
    }
}

export default RenderManager;