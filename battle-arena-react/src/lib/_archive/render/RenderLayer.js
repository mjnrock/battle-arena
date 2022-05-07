import { v4 as uuidv4 } from "uuid";

import TileCanvas from "./TileCanvas";

import Game from "./../Game";

export class RenderLayer extends TileCanvas {
    constructor(game, { drawAnimationFrame, tw = 32, th = 32, config = {} } = {}) {
        super(tw, th);

        this.__id = uuidv4();

        this.__game = game;
        // this.__cache = new Map();
        this.__hooks = [];

        if(typeof drawAnimationFrame === "function") {
            this.drawAnimationFrame = drawAnimationFrame.bind(this);
        }

        this.config = {
            ...this.config,
            ...config,
        };
    }

    get id() {
        return this.__id;
    }
    get game() {
        return this.__game || Game._;
    }
    // get cache() {
    //     return this.__cache;
    // }
    get hooks() {
        return this.__hooks;
    }

    // get(key) {
    //     return this.cache.get(key) || {};
    // }

    // set(key, data) {
    //     this.cache.set(key, data);

    //     return this;
    // }
    // check(key, data) {
    //     const oldData = this.get(key);

    //     return this.comparator(data, oldData);
    // }
    // attempt(key, data) {
    //     const result = this.check(key, data);

    //     if(result) {
    //         this.set(key, data);
    //     }

    //     return result;
    // }
    // clearCache() {
    //     this.__cache = new Map();

    //     return this;
    // }

    addHook(...fns) {
        this.__hooks.push(...fns);

        return this;
    }
}

export default RenderLayer;