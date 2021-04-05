import Agency from "@lespantsfancy/agency";

import Node from "../../util/Node";
import World from "../../World";
import Entity from "../../entity/Entity";
import Component from "../../entity/component/Component";

import nodeHandlers from "./node";
import worldHandlers from "./world";
import entityHandlers from "./entity";

export function init(game) {
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
        // () => "main",
        payload => {
            if(payload.emitter instanceof Node) {
                return "node";
            } else if(payload.emitter instanceof World) {
                return "world";
            } else if(payload.emitter instanceof Entity || payload.emitter instanceof Component) {
                return "entity";
            }
        },
    ]);

    return game;
}

export default init;