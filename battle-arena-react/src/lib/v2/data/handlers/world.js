export const handlers = [
    [ "join", (world, entity) => {
        if(world instanceof World) {
            entity.world.wayfinder.empty();
            
            entity.world.world = world.id;
            entity.world.vx = 0;
            entity.world.vy = 0;
        }
    }],
    [ "leave", (world, entity) => {
        if(world instanceof World) {
            entity.world.world = null;
        }
    }],
    [ "portal", (portal, entity) => {
        if(portal instanceof Portal) {
            //NOTE  This is needed to push the world changes to the end of the stack, otherwise multiple nodes get invoked
            //! This setTimeout is essential--both the portal node AND the teleportation node will activate without this delay
            setTimeout(() => {
                this.leaveWorld(entity);

                entity.world.x = portal.x;
                entity.world.y = portal.y;
                portal.world.joinWorld(entity);
            }, 0);
        }
    }],
    [ "contact", (actor, target) => {
        if(actor instanceof Entity && target instanceof Entity) {
            //TODO  Perform an interaction
            console.log(actor.meta.type, target.meta.type, target.world.x, target.world.y)
        }
    }],
    [ "interaction", (entity) => {
        const node = entity.world.getCurrentNode();

        if(!node.portal(entity)) {   // Prioritize portals
            for(let target of [ node.terrain, ...node.occupants ].reverse()) {
                if(target !== entity) {
                    //~!@
                    // this.$.emit("contact", entity, target);
                    Agency.Event.Emitter.$.$.emit("contact", entity, target);

                    return;    // Allow only one interaction--choose most recent entity addition first, terrain last
                }
            }
        }
    }],
];

export default handlers;