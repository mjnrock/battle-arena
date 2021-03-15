import LayeredCanvas from "./../util/render/LayeredCanvas";

import ImageRegistry from "../util/render/ImageRegistry";

export class RenderManager extends LayeredCanvas {
    constructor(width, height, { groups = [], repository } = {}) {
        super({ width, height });

        this.repository = repository;

        for(let group of groups) {
            this.addGroup(group);
        }
    }

    async loadImages(game, fn, ...args) {
        return await fn.call(this, game, ...args);
    }

    addGroup(group) {
        this.addLayer(group);

        return this;
    }

    sprite(root, ...coords) {
        const repo = this.repository.get(root);

        if(repo instanceof ImageRegistry) {
            return repo.get(...coords);
        }
    }
}

export default RenderManager;