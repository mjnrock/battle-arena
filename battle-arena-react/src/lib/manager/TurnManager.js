/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import Game from "../Game";

import { cast } from "../data/commands/combat";

export default class TurnManager extends Agency.Registry {
    constructor(game, { entities = [], current } = {}) {
        super({
            game,
            entities,
            current,
        });

        this.addGame(game);
    }

    get actor() {
        return this.entities[ this.current ];
    }

    addGame(game) {
        if(game instanceof Game) {
            this.game = game;
        }
    }

    addEntity(entity) {
        this.entities.push(entity);

        return this;
    }
    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);

        return this;
    }

    reorder(fn) {
        this.entities = new Set([ ...this.entities.values() ]).sort(fn || ((a, b) => a._born - b._born));

        return this;
    }

    perform(action, ...args) {        
        if(action === "cast") {
            cast(this.actor, ...args);
        }
        
        if(this.current === this.entities.length - 1) {
            this.current = 0;
        } else {
            ++this.current;
        }
    }
}