import Action from "../../action/Action";
import Affliction from "../../action/Affliction";
import Effect from "../../action/Effect";

export const handlers = [
    [ "action", ([ obj ]) => {
        const { action, source, tile } = obj;
        const world = source.world.getCurrentWorld();

        const afflictionGroup = Affliction.Flatten(action.afflictions);
        for(let afflictions of afflictionGroup) {
            for(let [ effects, rx, ry, opts = {} ] of afflictions) {
                const node = world.node(
                    tile.x + rx,
                    tile.y + ry,
                );

                if(node) {
                    for(let entity of node.occupants) {
                        Effect.Invoke(effects, {
                            target: entity,
                            source,
                            amount: 2,
                        });
                    }
                }
            }
        }
    }],
    [ "interaction", ([ entity ]) => {
        const node = entity.world.getCurrentNode();

        if(node && !node.portal(entity)) {   // Prioritize portals
            for(let target of [ node.terrain, ...node.occupants ].reverse()) {
                if(target !== entity) {
                    entity.$.emit("contact", { source: entity, target });

                    return;    // Allow only one interaction--choose most recent entity addition first, terrain last
                }
            }
        }
    }],
    [ "contact", ([{ source, target }]) => {
        console.log(source.meta.type, source.world.x, source.world.y, target.meta.type, target.world.x, target.world.y)
    }],
];

export default handlers;