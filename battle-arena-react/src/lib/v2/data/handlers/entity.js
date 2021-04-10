import Cooldown from "./../../util/Cooldown";

export const handlers = [
    [ "ability", ([ obj ]) => {
        const { source, afflictions, cost, cooldown, priority, escape, affected, ...rest } = obj;

        if(source.action.cooldown) {
            return;
        }

        const world = source.world.getCurrentWorld();

        if(!world) {
            return;
        }

        cost.forEach(cost => cost(source));
        source.action.cooldown = Cooldown.Generate(cooldown);

        //TODO  @range check
        let x, y;
        if(typeof rest.x === "number" && typeof rest.y === "number") {
            x = rest.x;
            y = rest.y;
        } else {
            x = source.world.x;
            y = source.world.y;
        }

        for(let afflictionGrid of afflictions) {
            for(let [ qualifier, rx, ry, effects ] of afflictionGrid) {
                const entities = [ ...(world.node(x + rx, y + ry) || {}).occupants ] || [];    

                if(typeof priority === "function") {
                    entities.sort((a, b) => {
                        let ap = priority({
                            target: a,
                            source,
                        });
                        let bp = priority({
                            target: b,
                            source,
                        });
    
                        return ap > bp ? -1 : 1;
                    });
                }

entityLoop:
                for(let entity of entities) {
                    if(escape({ affected, target: entity })) {
                        break entityLoop;
                    }

                    if(qualifier({ target: entity, source })) {
                        for(let effect of effects) {
                            effect.invoke({
                                target: entity,
                                source,
                            });
                        }
                    }
                    
                    affected.add(entity);
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