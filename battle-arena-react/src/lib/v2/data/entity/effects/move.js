import Agency from "@lespantsfancy/agency";
import Entity from "../../../Entity";

export const Random = (xmax, ymax) => (teid, target, source) =>{
    if(target instanceof Entity && target.position) {
        target.position.x = Agency.Util.Dice.random(1, xmax) - 1;
        target.position.y = Agency.Util.Dice.random(1, ymax) - 1;
    }
}

export default {
    Random,
};