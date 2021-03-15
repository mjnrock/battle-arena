import EntityManager from "./../../manager/EntityManager";
import TileCanvas from "./TileCanvas";

import Game from "./../../Game";

export class RenderLayer extends TileCanvas {
    constructor(entities = [], { game, painter, comparator, tw = 32, th = 32 } = {}) {
        super(tw, th);

        if(entities instanceof EntityManager) {
            this.entityMgr = entities;
        } else {
            this.entityMgr = new EntityManager(entities);
        }

        this.painter = painter;
        this.comparator = comparator;

        this.__cache = new Map();
        this.__game = game;

        this._config.clearBeforeDraw = false;
        // this.draw(0);
        this.start();
    }

    get game() {
        return this.__game || Game.$;
    }
    get cache() {
        return this.__cache;
    }

    get(key) {
        return this.cache.get(key) || {};
    }

    set(key, data) {
        this.cache.set(key, data);

        return this;
    }

    check(key, data) {
        const oldData = this.get(key);

        return this.comparator(data, oldData);
    }

    attempt(key, data) {
        const result = this.check(key, data);

        if(result) {
            this.set(key, data);
        }

        return result;
    }

    onDraw(dt, elapsed) {
        if(this.canvas.width !== this.game.render.width || this.canvas.height !== this.game.render.height) {
            this.canvas.width = this.game.render.width;
            this.canvas.height = this.game.render.height;
        }

        for(let entity of this.entityMgr.values) {
            this.painter.call(this, dt, elapsed, entity);
        }
    }
}

export default RenderLayer;