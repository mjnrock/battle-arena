import Agency from "@lespantsfancy/agency";
import Effect from "../../../action/Effect";
import Health from "../../../entity/component/Health";
import World from "../../../entity/component/World";

export const Name = "effect";
export const Accessor = (key) => Agency.Registry._[ Name ][ key ];

export function init() {
    Agency.Registry._.register(new Agency.Registry(), Name);     // Create the registry

    const entries = {
        heal: ({ target, amount = 0, isPercent = false }) => {
            if(Health.Has(target)) {
                if(isPercent) {
                    target.health.value.addPercent(amount);
                } else {
                    target.health.value.add(amount);
                }
            }
        },

        movement: {
            teleport: ({ target, x = null, y = null }) => {
                if(World.Has(target) && (x != null && y != null)) {
                    target.world.move(x, y);
                }
            },
            accelerate: ({ target, vx = 0, vy = 0 }) => {
                if(World.Has(target)) {
                    target.world.accelerate(vx, vy);
                }
            },
        },
    };

    //  Begin data loading
    for(let [ key, fn ] of Agency.Util.Helper.flatten(entries, { asArray: true })) {
        Agency.Registry._[ Name ].register(new Effect(fn), key);
    }
}

export default init;