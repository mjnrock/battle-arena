export const move = (entity, nx, ny, isRelative = false) => {
    if(isRelative === true) {
        entity.components.position.x += nx;
        entity.components.position.y += ny;
    } else {
        entity.components.position.x = nx;
        entity.components.position.y = ny;
    }

    return entity;
};

export const swap = (entity1, entity2) => {
    let tx = entity1.components.position.x,
        ty = entity1.components.position.y;

    entity1.components.position.x = entity2.components.position.x;
    entity1.components.position.y = entity2.components.position.y;

    entity2.components.position.x = tx;
    entity2.components.position.y = ty;

    return [ entity1, entity2 ];
};