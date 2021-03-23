import { v4 as uuidv4 } from "uuid";

import EntityManager from "./../../manager/EntityManager";
import TileCanvas from "./TileCanvas";

import Game from "./../../Game";

export class RenderLayer extends TileCanvas {
    constructor(entities = [], { game, painter, comparator, tw = 32, th = 32, config = {} } = {}) {
        super(tw, th);

        this.__id = uuidv4();

        this.entityManager = entities;  // trapped

        this.painter = painter;
        this.comparator = comparator;

        this.__cache = new Map();
        this.__game = game;
        this.__hooks = [];

        this._config = {
            ...this.config,
            ...config,
        };
        
        //STUB
        // this.draw(0);
        this.start();
    }

    get id() {
        return this.__id;
    }
    get game() {
        return this.__game || Game._;
    }
    get cache() {
        return this.__cache;
    }
    get hooks() {
        return this.__hooks;
    }

    get entityManager() {
        return this.__entityManager;
    }
    set entityManager(value) {
        if(value instanceof EntityManager) {
            this.__entityManager = value;
        } else if(Array.isArray(value)) {
            this.__entityManager = new EntityManager(value);
        }

        this.__cache = new Map();
        this.clear();
    }
    
    // get entityManager() {
    //     if(typeof this.__entityManager === "function") {
    //         return this.__entityManager();
    //     }

    //     return this.__entityManager;
    // }
    // set entityManager(value) {
    //     this.__cache = new Map();
    //     this.clear();

    //     if(typeof value === "function") {
    //         this.__entityManager = value;
    //     } else {
    //         if(value instanceof EntityManager) {
    //             this.__entityManager = value;
    //         } else if(Array.isArray(value)) {
    //             this.__entityManager = new EntityManager(value);
    //         }
    //     }
    // }

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

    addHook(...fns) {
        this.__hooks.push(...fns);

        return this;
    }

    onDraw(dt, elapsed) {
        if(this.canvas.width !== this.game.render.width || this.canvas.height !== this.game.render.height) {
            this.canvas.width = this.game.render.width;
            this.canvas.height = this.game.render.height;
        }

        for(let entity of this.entityManager.values) {
            this.painter.call(this, dt, elapsed, entity);
        }

        this.__hooks.forEach(fn => fn.call(this, dt, elapsed));
    }
}

export default RenderLayer;