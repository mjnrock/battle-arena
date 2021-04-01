import Path from "./../../../util/Path";

//! Component Schemas should always be functions
const _name = "action";

export const schema = {
    [ _name ]: ({ actions, ...rest } = {}) => ({
        actions: actions || {
            MOVE: {
                label: "Move",
                list: {}
            },
            CAST: {
                label: "Cast",
                list: {}
            },
        },
        ...rest,
    }),
};

export function hasAction(entity = {}) {
    return _name in entity;
}

export default schema;