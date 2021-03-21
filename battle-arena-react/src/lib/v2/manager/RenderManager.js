import { v4 as uuidv4 } from "uuid";
import Agency from "@lespantsfancy/agency";

import LayeredCanvas from "./../util/render/LayeredCanvas";
import ImageRegistry from "../util/render/ImageRegistry";

export class RenderManager extends LayeredCanvas {
    constructor(game, { groups = [], repository } = {}) {
        super();

        this.__id = uuidv4();
        this.__game = game;

        this.repository = repository;

        this.groups = new Agency.Registry();
        this.__current = null;

        for(let group of groups) {
            if(Array.isArray(group)) {
                this.useGroup(...group);
            } else {
                this.useGroup(group);
            }
        }
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

    useGroup(group, ...synonyms) {
        this.groups.register(group, ...synonyms);

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