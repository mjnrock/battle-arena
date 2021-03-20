//! Component Schemas should always be functions
const _name = "movement";

export const schema = {
    [ _name ]: ({ destination = [], path = [], range = 1 } = {}) => ({
        destination,
        path,
        range,
    }),
};

export function hasMovement(entity = {}) {
    return _name in entity;
}

export default schema;