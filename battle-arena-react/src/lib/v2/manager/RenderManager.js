import LayeredCanvas from "./../util/render/LayeredCanvas";

import RenderGroup from "../util/render/RenderGroup";
import ImageRegistry from "../util/render/ImageRegistry";

export class RenderManager extends LayeredCanvas {
    constructor(width, height, { groups = [], repository } = {}) {
        super({ width, height });

        this.repository = repository;

        for(let group of groups) {
            this.addGroup(group);
        }
    }

    addGroup(group) {
        if(group instanceof RenderGroup) {
            this.addLayer(group);
        }
    }

    sprite(root, ...coords) {
        const repo = this.repository.get(root);

        if(repo instanceof ImageRegistry) {
            return repo.get(...coords);
        }
    }
}

export default RenderManager;