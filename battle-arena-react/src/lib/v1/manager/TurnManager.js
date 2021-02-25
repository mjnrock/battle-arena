/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import Game from "../Game";

import { cast } from "../data/commands/combat";

export default class TurnManager extends Agency.Context {
    constructor(game, { entities = [], current = 0 } = {}) {
        super({
            game,
            entities,
            current,
        });

        this.addGame(game);
    }

    get actor() {
        return this._state.entities[ this._state.current ];
    }

    addGame(game) {
        if(game instanceof Game) {
            this.game = game;

            new Agency.Observer(this.game.entities.player, (...args) => {
                if(!Array.isArray(args[ 0 ])) {
                    console.log(...args);
                }
            });
        }
    }

    addEntity(...entities) {
        this.entities = [
            ...this.entities,
            ...entities,
        ];

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
        if(!this.actor) {
            return;
        }

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