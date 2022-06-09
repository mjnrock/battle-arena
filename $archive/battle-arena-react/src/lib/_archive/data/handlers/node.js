import Agency from "@lespantsfancy/agency";

export const handlers = [
    [ "portal", function([ node, portal, entity ]) {
        const world = entity.world.getCurrentWorld();
        Agency.Event.Network.$.emit(world, "portal", world, portal, entity);
    }],
];

export default handlers;