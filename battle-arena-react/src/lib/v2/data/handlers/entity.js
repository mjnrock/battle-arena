import Ability from "../../action/Ability";
import Cooldown from "./../../util/Cooldown";

export const handlers = [
    [ "ability", ([ obj ]) => {
        const { source, afflictions, cost, cooldown, priority, escape, affected, range, targetsOnly, ...rest } = obj;

        if(source.action.cooldown) {
            return;
        }

        const world = source.world.getCurrentWorld();

        if(!world) {
            return;
        }

        let x, y;
        if(typeof rest.x === "number" && typeof rest.y === "number") {
            x = rest.x;
            y = rest.y;
        } else {
            x = source.world.x;
            y = source.world.y;
        }
        
        if(!Ability.RangeCheck(x, y, source.world.x, source.world.y, range)) {
            return;
        }

        if(targetsOnly && !world.node(x, y).hasOccupants) {
            return;
        }

        cost.forEach(cost => cost(source));
        source.action.cooldown = Cooldown.Generate(cooldown);

        const entityEffects = new Map();
        for(let afflictionGrid of afflictions) {
            for(let [ qualifier, rx, ry, effects ] of afflictionGrid) {
                const entities = [ ...(world.node(x + rx, y + ry) || {}).occupants ] || [];

                for(let entity of entities) {
                    if(qualifier({ target: entity, source })) {
                        if(!(entityEffects.get(entity) instanceof Set)) {
                            entityEffects.set(entity, new Set());
                        }

                        for(let effect of effects) {
                            entityEffects.get(entity).add(effect);
                        }
                    }
                }
            }
        }
        
        const entities = [ ...entityEffects.entries() ].sort(([ a ], [ b ]) => {
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

        for(let [ entity, effects ] of entities) {
            if(escape({ affected, target: entity })) {
                break;
            }
            
            for(let effect of effects) {
                effect.invoke({
                    target: entity,
                    source,
                });
            }
                
            affected.add(entity);
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