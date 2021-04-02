import { v4 as uuidv4 } from "uuid";
import Agency from "@lespantsfancy/agency";

import LayeredCanvas from "./../render/LayeredCanvas";
import ImageRegistry from "../render/ImageRegistry";

import RenderLayer from "./../render/RenderLayer";

export class RenderManager extends LayeredCanvas {
    constructor(game, { tw, th, width, height, repository } = {}) {
        super({ tw, th, width, height });

        this.__id = uuidv4();
        this.__game = game;

        this.repository = repository;

        this.__current = null;

        this.drawAnimationFrame = this.drawAnimationLayers;
            
        // this.ctx.translate(this.game.config.render.tile.width / 2, this.game.config.render.tile.height / 2);
    }

    get id() {
        return this.__id;
    }
    get game() {
        return this.__game;
    }
    
    set canvas(canvas) {
        //TODO  Transition the EventWatchable in React to this trap
        console.warn(`[RenderManager]: The << set canvas >> trap has been called.`);
        return Reflect.set(this, "_canvas", canvas);
    }

    //FIXME Determine if the RenderManager should have its own "current world" or if it should just use game.world.current
    //STUB  This is a partial stub for "world-terrain-layer > .drawAnimationFrame"
    get current() {
        return this.__current;
    }
    set current(world) {
        this.__current = world;

        return this;
    }

    async loadImages(fn, ...args) {
        return await fn.call(this, this.game, ...args);
    }

    /**
     * A convenience method to auto-create a RenderLayer using only draw functions.
     * @param  {...fn} layerDrawFns 
     * @returns 
     */
    addAnimationLayers(...layerDrawFns) {
        for(let fn of layerDrawFns) {
            const layer = new RenderLayer(this.game, { drawAnimationFrame: fn });

            this.addLayer(layer);
        }

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