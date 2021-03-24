//! Component Schemas should always be functions
const _name = "movement";

export const schema = {
    [ _name ]: ({ destination = [], path = [], speed = 5 } = {}) => ({
        destination,
        path,
        speed,
    }),
};

export function hasMovement(entity = {}) {
    return _name in entity;
}

export default schema;