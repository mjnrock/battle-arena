export const setCondition = (entity, condition) => {
    entity.components.condition.current = condition;

    return entity;
};