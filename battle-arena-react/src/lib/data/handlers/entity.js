import Ability from "../../action/Ability";
import { EnumEntityType } from "../../entity/component/Meta";
import { EnumState } from "../../entity/component/State";
import Cooldown from "./../../util/Cooldown";

export const handlers = [
    [ "destroy", ([ entity ]) => {
        const world = entity.world.getCurrentWorld();
        if(world) {
            world.leaveWorld(entity);
        }

        // entity.__destroy();
    }],
    [ "casting", ([ entity, ability ], { game }) => {
        //TODO  If interrupted, remove CASTING state
        entity.action.cooldown = Cooldown.Generate(ability.castTime);
        entity.state.alter(EnumState.CASTING, ability.castTime, { next: state => {
            entity.$.emit("ability", ability);

            return state.default;
        }});
    }],
    [ "ability", ([ obj ], { game }) => {
        const { source, afflictions, cost, cooldown, priority, escape, affected, range, targeted, ...rest } = obj;

        const world = source.world.getCurrentWorld();

        if(!world) {
            return;
        }

        let x, y;
        if(rest.atCursor) {
            x = game.config.MOUSE_POSITION[ 0 ];
            y = game.config.MOUSE_POSITION[ 1 ];
        } else if(typeof rest.x === "number" && typeof rest.y === "number") {
            x = rest.x;
            y = rest.y;
        } else {
            x = source.world.x;
            y = source.world.y;
        }
        
        if(!Ability.RangeCheck(x, y, source.world.x, source.world.y, range)) {
            //STUB
            //FIXME  General idea: if has "atCursor" flag and out of range, cast on self --> but obviously this is only useful for beneficial spells --> but how to know that prima facie?
            if(rest.atCursor) {
                x = source.world.x;
                y = source.world.y;
            } else {
                return;
            }
        }

        if(targeted && !(world.node(x, y) || {}).hasOccupants) {
            return;
        }

        cost.forEach(cost => cost(source));
        source.action.cooldown = Cooldown.Generate(Math.max(cooldown, game.config.time.GCD));

        const entityEffects = new Map();
        for(let afflictionGrid of afflictions) {
            for(let [ qualifier, rx, ry, effects ] of afflictionGrid) {
                const entities = (world.node(x + rx, y + ry) || {}).occupants || [];

                for(let entity of [ ...entities ]) {
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
            }) || 0;
            let bp = priority({
                target: b,
                source,
            }) || 0;

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
                
                world.create({
                    meta: { type: EnumEntityType.EFFECT, subtype: "fire", lifespan: Math.min(1000, cooldown) },
                    state: {},
                    world: { x: ~~entity.world.x + 0.5, y: ~~entity.world.y + 0.5 },
                    effect: { target: entity }  // lock the effect's position to the @target entity
                    //FIXME While the effect is currently only graphical, the ComponentEffect could be turned into a ComponentAction to handle edge conditions (e.g. MaxAffected)  << create relationship: Child(ren) <--> Parent >>
                    // effect: { qualifier, effect, args: obj },
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
        console.log(source.meta.subtype, source.world.x, source.world.y, target.meta.subtype, target.world.x, target.world.y)
    }],
];

export default handlers;