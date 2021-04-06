import Agency from "@lespantsfancy/agency";
import Health from "../../../entity/component/Health";
import World from "../../../entity/component/World";

export const Name = "effects";
export const Accessor = (key) => Agency.Registry._[ Name ][ key ];

export function init() {
    Agency.Registry._.register(new Agency.Registry(), Name);     // Create the registry

    const entries = [
        [ "heal", ({ target, amount = 0, isPercent = false }) => {
            const { amount } = rest;

            if(Health.Has(target)) {
                if(isPercent) {
                    target.health.value.addPercent(amount);
                } else {
                    target.health.value.add(amount);
                }
            }
        } ],

        [ "teleport", ({ target, ...rest }) => {
            const { x, y } = rest;

            if(World.Has(target)) {
                target.world.move(x, y);
            }
        } ],
        [ "accelerate", ({ target, ...rest }) => {
            const { vx, vy } = rest;

            if(World.Has(target)) {
                target.world.accelerate(vx, vy);
            }
        } ],
    ];

    //  Begin data loading
    for(let [ key, fn ] of entries) {
        Agency.Registry._[ Name ].register(fn, key);
    }
}

export default init;