import Agency from "@lespantsfancy/agency";

import World from "../../../World";

//! Component Schemas should always be functions
const _name = "position";

export const schema = {
    [ _name ]: ({ x, y, facing = 0, world, ...rest } = {}) => ({
        world: world instanceof World ? world.id : world,
        facing,
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        

        ...rest,
    }),
};

export function hasPosition(entity = {}) {
    return _name in entity;
}

export default schema;