import World from "../../../World";

//! Component Schemas should always be functions
const _name = "action";

export const schema = {
    [ _name ]: ({ actions, ...rest } = {}) => ({
        actions: actions || {
            MOVE: {
                label: "Move",
                list: {
                    nudge: (game, entity, dx, dy) => {
                        entity.position.x += dx;
                        entity.position.y += dy;
                    },
                    move: (game, entity, nx, ny) => {
                        entity.position.x = nx;
                        entity.position.y = ny;
                    },
                }
            },
        },
        ...rest,
    }),
};

export function hasAction(entity = {}) {
    return _name in entity;
}

export default schema;