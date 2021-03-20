import Agency from "@lespantsfancy/agency";

export function random(entity) {    
    const random = () => Math.round(parseFloat((Agency.Util.Dice.random(-5, 5) / 5)));
    
    if(Agency.Util.Dice.coin()) {
        entity.position.x = Math.max(0, Math.min(19, entity.position.x + random()));
        entity.position.y = Math.max(0, Math.min(19, entity.position.y + random()));
        entity.position.facing = Math.floor(Math.random() * 4) * 90;
    }

    // entity.position.x = 10;
    // entity.position.y = 10;
    // entity.position.facing = 90;

    // console.log(entity.position.toData())
}

export default {
    random,
};