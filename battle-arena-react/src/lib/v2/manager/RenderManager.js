import LayeredCanvas from "./../util/render/LayeredCanvas";

import ImageRegistry from "../util/render/ImageRegistry";
import RenderLayer from "../util/render/RenderLayer";
import EntityManager from "./EntityManager";

export class RenderManager extends LayeredCanvas {
    constructor(width, height, { renderLayer = [], repository } = {}) {
        super({ width, height });

        this.repository = repository;

        for(let layer of renderLayer) {
            this.addRenderLayer(layer);
        }
    }

    async loadImages(game, fn, ...args) {
        return await fn.call(this, game, ...args);
    }

    addRenderLayer(layer) {
        if(layer instanceof RenderLayer) {
            this.addLayer(layer);
        } else if(layer instanceof EntityManager) {
            this.addLayer(new RenderLayer(...arguments));
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