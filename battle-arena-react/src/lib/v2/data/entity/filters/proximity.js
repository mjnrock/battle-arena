import Entity from "./../../../Entity";

export function Range(eid, entity, x, y, r = 0) {
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