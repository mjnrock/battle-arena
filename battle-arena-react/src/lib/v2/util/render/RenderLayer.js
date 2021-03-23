import { v4 as uuidv4 } from "uuid";

import TileCanvas from "./TileCanvas";

import Game from "./../../Game";

export class RenderLayer extends TileCanvas {
    constructor(game, { drawFrame, tw = 32, th = 32, config = {} } = {}) {
        super(tw, th);

        this.__id = uuidv4();

        this.__game = game;
        this.__hooks = [];

        if(typeof drawFrame === "function") {
            this.drawFrame = drawFrame.bind(this);
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
    get hooks() {
        return this.__hooks;
    }

    addHook(...fns) {
        this.__hooks.push(...fns);

        return this;
    }
}

export default RenderLayer;