import Agency from "@lespantsfancy/agency";

//! Component Schemas should always be functions
const _name = "task";

export const schema = {
    [ _name ]: (timeout) => ({
        current: (entity) => {
            const random = () => Math.round(parseFloat((Agency.Util.Dice.random(-5, 5) / 5)));
            
            entity.position.x += random();
            entity.position.y += random();
        },
        timeout,
        timeoutStart: 0,
    }),
};

export function hasTask(entity = {}) {
    return _name in entity;
}

export default schema;