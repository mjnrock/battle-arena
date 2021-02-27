import Agency from "@lespantsfancy/agency";

export class Action extends Agency.Mutator {
    constructor(filter, ...effects) {
        super(effects, filter);
    }

    perform(source, entities = {}, selectionArgs = [], applyArgs = []) {
        const selected = this.select(entities, ...selectionArgs);
        
        return this.apply(selected, source, ...applyArgs);
    }
}

export function Factory(filter, ...effects) {
    return new Action(filter, ...effects);
}
export function Spawn(filter, effects = [], source, entities = {}, selectionArgs = [], applyArgs = []) {
    if(!Array.isArray(effects)) {
        effects = [ effects ];
    }
    const action = Factory(filter, ...effects);
    
    return action.perform(source, entities, selectionArgs, applyArgs);
}

Action.Factory = Factory;
Action.Spawn = Spawn;

export default Action;