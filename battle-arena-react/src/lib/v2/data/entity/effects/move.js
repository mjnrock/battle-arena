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

export const CenterPoint = (shape) => (target, source) => {
    if(target instanceof Entity && target.position && shape instanceof Point) {
        const { x, y } = shape.origin;

        target.position.x = x;
        target.position.y = y;
    }
}
export const Attract = (shape, amplify = 1.0, threshold = 0) => (target, source) => {
    if(target instanceof Entity && target.position && shape instanceof Point) {
        const { x, y } = shape.origin;

        let trig;
        const { cos, sin, hypot, vx, vy } = trig = getTrig(
            target.position.x,
            target.position.y,
            x,
            y,
        );

        if(typeof amplify === "function") {
            amplify = amplify(trig, target, source);
        }
            
        let dx = 0;
        if(cos > threshold) {
            dx = (vx * cos / hypot) * amplify;
        } else if(cos <= -threshold) {
            dx = -(vx * cos / hypot) * amplify;
        }

        let dy = 0;
        if(sin > threshold) {
            dy = (vy * sin / hypot) * amplify;
        } else if(sin <= -threshold) {
            dy = -(vy * sin / hypot) * amplify;
        }

        target.position.x = Math.round(parseFloat(target.position.x + dx));
        target.position.y = Math.round(parseFloat(target.position.y + dy));
    }
}

export default {
    getAngle,

    Random,
    CenterPoint,
    Attract,
};