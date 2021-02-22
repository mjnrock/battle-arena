import { EnumEffectType } from "../../Effect";

export const damage = (entity, amount, { method = "+" } = {}) => {
    if(!entity) {
        return;
    }
    
    if(method === "+") {
        entity.components.attributes.HP.current -= amount;
    } else if(method === "-") {
        entity.components.attributes.HP.current += amount;
    } else if(method === "%") {
        entity.components.attributes.HP.current -= (amount / 100 * entity.components.attributes.HP.max);
    } else if(method === "-%") {
        entity.components.attributes.HP.current += (amount / 100 * entity.components.attributes.HP.max);
    } else if(method === "=#") {
        entity.components.attributes.HP.current = amount;
    } else if(method === "=%") {
        entity.components.attributes.HP.current = (amount / 100 * entity.components.attributes.HP.max);
    }
};

export const schema = {
    type: EnumEffectType.DAMAGE,
    effect: damage,
    only: 0,
    ignore: 0,
};

export default schema;