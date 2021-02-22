import Game from "./../../Game";
import Entity from "./../../Entity";

import entityEffectSchema from "./../schemas/entity-effect";

export const cast = (entity, abilityKey, { x: nx, y: ny, isRelative = false } = {}) => {
    if(!entity.components.abilities.all[ abilityKey ]) {
        return;
    }

    let ex = entity.components.position.x,
        ey = entity.components.position.y;

    if(nx !== void 0 && ny !== void 0) {
        if(isRelative === true) {
            ex += nx;
            ey += ny;
        } else {
            ex = nx;
            ey = ny;
        }
    }

    const effects = entity.components.abilities.all[ abilityKey ].perform(ex, ey);
    for(let [ x, y, effect, magnitudeFn ] of effects) {

        //  Register effect entity, if necessary
        const ent = Entity.FromSchema(entityEffectSchema, {
            position: [ x, y ],
            condition: [ effect.type === 1 ? "ATTACKING" : "IDLE" ],    // Debug way to render different colors
            //TODO Put more variables relevant to the @effect
        });
        Game.$.entities.register(ent);

        //  Apply the effects over all entities if at position
        for(let e of Game.$.entities.values) {
            if(e.components.type.current !== "EFFECT" && e.components.position.x === x && e.components.position.y === y) {
                if(typeof magnitudeFn === "function") {
                    effect.affect(e, magnitudeFn(e, entity));       // Dynamically calculate magnitude based on target and/or source entity
                } else if(!Number.isNaN(+magnitudeFn)) {
                    effect.affect(e, +magnitudeFn);     // Numerically declare magnitude
                } else {
                    effect.affect(e);   // Magnitude not relevant to this effect (e.g. kill, teleport, etc.);
                }
            }
        }
    }

    return effects;
};