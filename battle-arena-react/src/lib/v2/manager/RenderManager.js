import { v4 as uuidv4 } from "uuid";
import Agency from "@lespantsfancy/agency";

import Registry from "./../util/Registry";

import LayeredCanvas from "./../util/render/LayeredCanvas";
import ImageRegistry from "../util/render/ImageRegistry";

export class RenderManager extends LayeredCanvas {
    constructor(game, { tw, th, width, height, repository } = {}) {
        super({ tw, th, width, height });

        this.__id = uuidv4();
        this.__game = game;

        this.repository = repository;

        this.__current = null;

        this.drawAnimationFrame = this.drawAnimationLayers;
    }

    get id() {
        return this.__id;
    }
    get game() {
        return this.__game;
    }

    get current() {
        return this.__current;
    }

    async loadImages(fn, ...args) {
        return await fn.call(this, this.game, ...args);
    }

    useGroup(group) {
        if(!this.__current) {
            this.__current = group;
        }

        this.stopAll();
        this.removeAllLayers();

        this.width = group.width;
        this.height = group.height;

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