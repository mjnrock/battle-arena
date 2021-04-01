import Wayfinder from "../../../util/Wayfinder";

//! Component Schemas should always be functions
const _name = "movement";

export const schema = {
    [ _name ]: ({ path = [], speed = 2.5, ...rest } = {}) => ({
        wayfinder: new Wayfinder(),
        path,
        speed,
        ...rest,
    }),
};

export function hasMovement(entity = {}) {
    return _name in entity;
}

export default schema;