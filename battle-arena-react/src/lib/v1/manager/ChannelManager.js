/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import KeyManager from "./KeyManager";
import MouseManager from "./MouseManager";
import Game from "./../Game";

import { move } from "./../data/commands/movement";
import { setCondition } from "./../data/commands/component-condition";
import { cast } from "./../data/commands/combat";

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

            this.subscribe("key", (ctx, eventType, ...args) => {
                if(eventType === "up") {
                    setCondition(this.game.entities.player, "IDLE");
                } else if(eventType === "down") {
                    const [ which ] = args;
                    const player = this.game.entities.player;

                    if(which === 68 || which === 39) {
                        move(player, 1, 0, true);
                        setCondition(player, "RUNNING");
                    } else if(which === 65 || which === 37) {
                        move(player, -1, 0, true);
                        setCondition(player, "RUNNING");
                    } else if(which === 87 || which === 38) {
                        move(player, 0, -1, true);
                        setCondition(player, "RUNNING");
                    } else if(which === 83 || which === 40) {
                        move(player, 0, 1, true);
                        setCondition(player, "RUNNING");
                    } else if(which === 32) {
                        setCondition(player, "ATTACKING");
                        cast(this.game.entities.player, 0);
                    } else if(which >= 49 && which <= 57) {
                        setCondition(player, "ATTACKING");
                        cast(this.game.entities.player, which - 48);
                    }
                }
            });
            this.subscribe("mouse", (ctx, eventType, buttons, obj) => {
                if(eventType === "click") {
                    const { txi, tyi } = obj;
                    for(let entity of this.game.entities.values) {
                        if(entity.components.type.current !== "EFFECT" && entity.components.position.x === txi && entity.components.position.y === tyi) {
                            console.log(entity.components.attributes.HP.toData());
                        }
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