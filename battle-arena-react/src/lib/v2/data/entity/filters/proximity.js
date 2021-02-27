import Entity from "./../../../Entity";

export const Range = (x, y, r = 0) => (eid, entity) => {
    return entity instanceof Entity
        && entity.position
        && entity.position.x >= x - r
        && entity.position.x <= x + r
        && entity.position.y >= y - r
        && entity.position.y <= y + r;
}

export default {
    Range,
};