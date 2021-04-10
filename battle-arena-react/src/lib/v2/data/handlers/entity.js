import Cooldown from "./../../util/Cooldown";

export const handlers = [
    [ "ability", ([ obj ]) => {
        const { source, afflictions, cost, cooldown, ...rest } = obj;
        const world = source.world.getCurrentWorld();

        //TODO  @range check
        if(source.action.cooldown) {
            return;
        }

        cost.forEach(cost => cost(source));
        source.action.cooldown = Cooldown.Generate(cooldown);

        for(let afflictionGrid of afflictions) {
            for(let [ qualifier, rx, ry, effects ] of afflictionGrid) {
                let x, y;
                if(typeof rest.x === "number" && typeof rest.y === "number") {
                    x = rest.x;
                    y = rest.y;
                } else {
                    x = source.world.x;
                    y = source.world.y;
                }

                const entities = (world.node(x + rx, y + ry) || {}).occupants || [];
    
                for(let entity of entities) {
                    if(qualifier({ target: entity, source })) {
                        for(let effect of effects) {
                            effect.invoke({
                                target: entity,
                                source,
                            });
                        }
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