import Agency from "@lespantsfancy/agency";
import { v4 as uuidv4 } from "uuid";

import LayeredCanvas from "./../render/LayeredCanvas";
import ImageRegistry from "../render/ImageRegistry";

import RenderLayer from "./../render/RenderLayer";

import initializeBindings from "./../input/_init";
import { Camera } from "../render/Camera";

export class RenderManager extends LayeredCanvas {
    constructor(game, { tw, th, width, height, repository } = {}) {
        super({ tw, th, width, height });

        this.__id = uuidv4();
        this.__game = game;

        // this.camera = new Camera(game, this);   //? Draw the entire map
        this.camera = new Camera(game, this, {   //? Draw around the main player
            subject: {
                entity: game.players.player,
                txr: 5.5,
                tyr: 4.5,
            },
        });

        this.repository = repository;
        this.drawAnimationFrame = this.drawAnimationLayers;
        
        this.ctx.imageSmoothingEnabled = false;

        //? Key and Mouse Bindings
        this.handler = new Agency.Event.Emitter();
        initializeBindings(this.game);
    }

    get id() {
        return this.__id;
    }
    get game() {
        return this.__game;
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