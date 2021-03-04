import Agency from "@lespantsfancy/agency";

//! Component Schemas should always be functions
const _name = "turn";

export const schema = {
    [ _name ]: ({ timeout, timeoutStart = 0 } = {}) => ({
        current: (entity) => {
            const random = () => Math.round(parseFloat((Agency.Util.Dice.random(-5, 5) / 5)));
            
            entity.position.x = Math.max(0, Math.min(19, entity.position.x + random()));
            entity.position.y = Math.max(0, Math.min(19, entity.position.y + random()));
        },
        timeout,
        timeoutStart,
    }),
};

export function hasTurn(entity = {}) {
    return _name in entity;
}

export default schema;