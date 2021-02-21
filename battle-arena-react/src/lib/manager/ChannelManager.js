/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import KeyManager from "./KeyManager";
import MouseManager from "./MouseManager";
import Game from "./../Game";

export default class ChannelManager extends Agency.Channel {
    constructor(game) {
        super();

        this.addGame(game);
    }

    addGame(game) {
        if(game instanceof Game) {
            this.game = game;

            this.watch("key", KeyManager.$);
            this.watch("mouse", MouseManager.$);

            this.subscribe("key", (ctx, ...args) => {
                const [ eventType ] = args;

                if(eventType === "up") {
                    this.game.entities.player.components.condition.current = "IDLE";
                } else if(eventType === "down") {
                    const which = args[ 1 ];

                    if(which === 68 || which === 39) {
                        ++this.game.entities.player.components.position.x;

                        this.game.entities.player.components.condition.current = "RUNNING";
                    } else if(which === 65 || which === 37) {
                        --this.game.entities.player.components.position.x;

                        this.game.entities.player.components.condition.current = "RUNNING";
                    } else if(which === 87 || which === 38) {
                        --this.game.entities.player.components.position.y;

                        this.game.entities.player.components.condition.current = "RUNNING";
                    } else if(which === 83 || which === 40) {
                        ++this.game.entities.player.components.position.y;

                        this.game.entities.player.components.condition.current = "RUNNING";
                    } else if(which === 32) {
                        this.game.entities.player.components.condition.current = "ATTACKING";

                        this.game.abilities(0);
                    } else if(which >= 49 && which <= 57) {
                        this.game.entities.player.components.condition.current = "ATTACKING";

                        this.game.abilities(which - 48);
                    }
                }
            });
        }
    }

    subscribe(type, fn) {        
        if(typeof fn === "function") {
            return super.subscribe((ctx, eventType, ...args) => {
                if(eventType === type) {
                    fn(ctx, ...args);
                }
            });
        }

        return this;
    }
}