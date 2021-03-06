import Agency from "@lespantsfancy/agency";

export function random(entity) {    
    const random = () => Math.round(parseFloat((Agency.Util.Dice.random(-5, 5) / 5)));
            
    entity.position.x = Math.max(0, Math.min(19, entity.position.x + random()));
    entity.position.y = Math.max(0, Math.min(19, entity.position.y + random()));
    entity.position.facing = Math.floor(Math.random() * 3) * 90;
}

export default {
    random,
};