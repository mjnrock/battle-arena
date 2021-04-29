import Agency from "@lespantsfancy/agency";

import World from "../../world/World";
import Entity from "../../entity/Entity";
import Component from "../../entity/component/Component";

import nodeHandlers from "./node";
import worldHandlers from "./world";
import entityHandlers from "./entity";
import Ability from "../../action/Ability";
import NodeManager from "../../manager/NodeManager";

export function init(game) {
    // game.networks.input.router.createContexts([
    //     [ "mouse", {
    //         globals: {
    //             game: this,
    //         },
    //     }],
    //     [ "key", {
    //         globals: {
    //             game: this,
    //         },
    //     }],
    // ]);        
    // game.networks.input.router.createRoutes([
    //     payload => payload.type,
    // ]);

    // game.networks.world.router.createContexts([
    //     [ "node", {
    //         globals: {
    //             game,
    //         },
    //         handlers: {
    //             ...Object.fromEntries(nodeHandlers),
    //         },
    //     }],
    //     [ "world", {
    //         globals: {
    //             game,
    //         },
    //         handlers: {
    //             ...Object.fromEntries(worldHandlers),
    //         },
    //     }],
    //     [ "entity", {
    //         globals: {
    //             game,
    //         },
    //         handlers: {
    //             ...Object.fromEntries(entityHandlers),
    //         },
    //     }],
    // ]);
    
    // game.networks.world.router.createRoutes([
    //     payload => {
    //         if(payload.emitter instanceof NodeManager) {
    //             return "node";
    //         } else if(payload.emitter instanceof World) {
    //             return "world";
    //         } else if(
    //             payload.emitter instanceof Entity
    //             || payload.emitter instanceof Component
    //             || payload.emitter instanceof Ability
    //         ) {
    //             return "entity";
    //         }
    //     },
    // ]);

    Agency.Event.Network.$.router.createContexts([
        [ "node", {
            globals: {
                game,
            },
            handlers: {
                ...Object.fromEntries(nodeHandlers),
            },
        }],
        [ "world", {
            globals: {
                game,
            },
            handlers: {
                ...Object.fromEntries(worldHandlers),
            },
        }],
        [ "entity", {
            globals: {
                game,
            },
            handlers: {
                ...Object.fromEntries(entityHandlers),
            },
        }],
    ]);
    
    Agency.Event.Network.$.router.createRoutes([
        payload => {
            if(payload.emitter instanceof NodeManager) {
                return "node";
            } else if(payload.emitter instanceof World) {
                return "world";
            } else if(
                payload.emitter instanceof Entity
                || payload.emitter instanceof Component
                || payload.emitter instanceof Ability
            ) {
                return "entity";
            }
        },
    ]);

    return game;
}

export default init;