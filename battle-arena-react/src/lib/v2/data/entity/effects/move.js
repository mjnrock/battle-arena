import Agency from "@lespantsfancy/agency";
import Entity from "../../../Entity";

export function Random(eid, entity, source, xmax, ymax) {
    if(entity instanceof Entity && entity.position) {
        entity.position.x = Agency.Util.Dice.random(1, xmax) - 1;
        entity.position.y = Agency.Util.Dice.random(1, ymax) - 1;
    }
}

export default {
    Random,
};