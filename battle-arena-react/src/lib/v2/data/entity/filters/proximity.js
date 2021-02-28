import Entity from "./../../../Entity";

export const Range = (shape) => (eid, entity) => {
    return entity instanceof Entity
        && entity.position
        && shape.hasIntersection(
            entity.position.x,
            entity.position.y,
        );
}

export default {
    Range,
};