import Agency from "@lespantsfancy/agency";

import World from "./../../World";
import Entity from "./../../entity/Entity";
import Portal from "./../../util/Portal";

export const handlers = [
    [ "join", ([ world, entity ]) => {
        if(world instanceof World) {
            entity.world.wayfinder.empty();
            
            entity.world.world = world.id;
            entity.world.vx = 0;
            entity.world.vy = 0;
        }
    }],
    [ "leave", ([ world, entity ]) => {
        if(world instanceof World) {
            entity.world.world = null;
        }
    }],
    [ "portal", ([ portal, entity ]) => {
        entity.world.getCurrentWorld().leaveWorld(entity);

        entity.world.x = portal.x;
        entity.world.y = portal.y;
        portal.world.joinWorld(entity);
    }],
];

export default handlers;