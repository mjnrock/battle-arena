import Agency from "@lespantsfancy/agency";

export function random(entity) {    
    const random = () => Math.round(parseFloat((Agency.Util.Dice.random(-5, 5) / 5)));
    
    if(Agency.Util.Dice.coin()) {
        entity.world.x = Math.max(0, Math.min(19, entity.world.x + random()));
        entity.world.y = Math.max(0, Math.min(19, entity.world.y + random()));
        entity.world.facing = Math.floor(Math.random() * 4) * 90;
    }

    // entity.world.x = 10;
    // entity.world.y = 10;
    // entity.world.facing = 90;

    // console.log(entity.world.toData())
}

export default {
    random,
};