// import Observable from "./Observable";
// export class Entity extends Observable {

import Agency from "@lespantsfancy/agency";

import Component from "./Component";
export class Entity extends Agency.Observable {
    constructor() {
        super();
    }
}

//? A <Component> schema should only ever have ONE (1) entry i.e. { [_name]: { ...} }
export function FromSchema(schemaWithArgs = []) {
    let entity = new Entity();

    for(let [ comp, argObj ] of schemaWithArgs) {        
        const key = Object.keys(comp)[ 0 ];
        entity[ key ] = Component.FromSchema(comp, argObj);
    }

    return entity;
}

Entity.FromSchema = FromSchema;

export default Entity;