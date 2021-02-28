import Agency from "@lespantsfancy/agency";

import Point from "./../../../util/Point";
import Entity from "../../../Entity";

export function getAngle(x1, y1, x2, y2) {
    let dy = y2 - y1;
    let dx = x2 - x1;
    let theta = Math.atan2(-dy, dx);

    return theta;
}
export function getTrig(x1, y1, x2, y2) {
    let dy = y2 - y1;
    let dx = x2 - x1;
    let theta = Math.atan2(-dy, dx);

    const obj = {
        theta,
        cos: Math.cos(theta),
        sin: -Math.sin(theta),
        hypot: Math.hypot(dy, dx),
    };

    obj.vx = obj.hypot * obj.cos;
    obj.vy = obj.hypot * obj.sin;

    return obj;
}

export const Random = (xmax, ymax) => (target, source) =>{
    if(target instanceof Entity && target.position) {
        target.position.x = Agency.Util.Dice.random(1, xmax) - 1;
        target.position.y = Agency.Util.Dice.random(1, ymax) - 1;
    }
}

export const CenterPoint = (shape, goto = false) => (target, source) => {
    if(target instanceof Entity && target.position && shape instanceof Point) {
        if(goto === true) {
            const { x, y } = shape.origin;
    
            target.position.x = x;
            target.position.y = y;
        } else {
            const { x, y } = shape.origin;
            const { cos, sin } = getTrig(
                target.position.x,
                target.position.y,
                x,
                y,
            );
            
            let dx = 0;
            if(cos >= 0.5) {
                dx = 1;
            } else if(cos <= -0.5) {
                dx = -1;
            }

            let dy = 0;
            if(sin >= 0.5) {
                dy = 1;
            } else if(sin <= -0.5) {
                dy = -1;
            }
    
            target.position.x += dx;
            target.position.y += dy;
        }
    }
}

export default {
    getAngle,

    Random,
    CenterPoint,
};