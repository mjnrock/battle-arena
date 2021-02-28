import Entity from "../../../Entity";

/**
 * If you need to check the perimeter tiles, use PointCircle.GetPoints(@circle | x,y,r)
 * @param {Circle} circle
 * @param {[[tx,ty], ...]} perimeterTiles | All the *integer* perimeter points of the circle.  Used for tile/grid conversion errors.
 */
export const IsEntityWithinCircle = (circle, perimeterTiles = []) => (eid, entity) => {
    if(entity instanceof Entity && entity.position) {
        //  Generic circle intersection--this will miss perimeter tiles in cases like (x,y,r=[0,0,3] and [tx,ty]=[3,1])
        if(circle.hasIntersection(Math.floor(entity.position.x), Math.floor(entity.position.y))) {
            return true;
        }

        //  If distance fails, check explicitly for perimeter tile, if passed
        if(perimeterTiles.length) {
            return perimeterTiles.some(([ x, y ]) => {
                return x === Math.floor(entity.position.x) && y === Math.floor(entity.position.y);
            });
        }
    }

    return false;
}

export const IsEntityWithinRectangle = (rectangle) => (eid, entity) => {
    if(entity instanceof Entity && entity.position) {
        return rectangle.hasIntersection(
            Math.floor(entity.position.x),
            Math.floor(entity.position.y),
        );
    }

    return false;
}

export default {
    IsEntityWithinCircle,
    IsEntityWithinRectangle,
};