//! Component Schemas should always be functions
const _name = "position";

export const schema = {
    [ _name ]: (x, y, facing = 0) => ({
        facing,
        x: x,
        y: y,
    }),
};

export function hasPosition(entity = {}) {
    return _name in entity;
}

export default schema;