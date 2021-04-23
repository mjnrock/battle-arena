import World from "./../../world/World";
import ComponentWorld from "./../../entity/component/World";

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
        if(world instanceof World && ComponentWorld.Has(entity)) {
            entity.world.world = null;
        }
    }],
    [ "portal", ([ world, portal, entity ]) => {
        world.leaveWorld(entity);

        entity.world.x = portal.x;
        entity.world.y = portal.y;
        portal.world.joinWorld(entity);
    }],
];

export default handlers;