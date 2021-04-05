export const handlers = [
    [ "interaction", ([ entity ]) => {
        const node = entity.world.getCurrentNode();

        if(node && !node.portal(entity)) {   // Prioritize portals
            for(let target of [ node.terrain, ...node.occupants ].reverse()) {
                if(target !== entity) {
                    entity.$.emit("contact", entity, target);

                    return;    // Allow only one interaction--choose most recent entity addition first, terrain last
                }
            }
        }
    }],
    [ "contact", ([ actor, target ]) => {
        console.log(actor.meta.type, actor.world.x, actor.world.y, target.meta.type, target.world.x, target.world.y)
    }],
];

export default handlers;