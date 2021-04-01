import { v4 as uuidv4 } from "uuid";
import Terrain from "./util/component/Terrain";
import World from "./util/component/World";
import Action from "./util/component/Action";

export class Entity {
    constructor(game) {
        this.__id = uuidv4();
        this.__game = game;
    }

    get id() {
        return this.__id;
    }
    get game() {
        return this.__game;
    }
}

//? A <Component> schema should only ever have ONE (1) entry i.e. { [_name]: { ...} }
/**
 * 
 * @param {[ [ componentFn, argObj ], ... ]} schemaWithArgs 
 * @param {fn} callback | Useful for post-init/circular assignments
 * @returns 
 */
export function FromSchema(game, schemaWithArgs = [], callback) {
    let entity = new Entity(game);

    for(let [ comp, argObj ] of schemaWithArgs) {        
        const key = Object.keys(comp)[ 0 ];

        //STUB
        if(key === "world") {
            entity[ key ] = new World(game, entity, argObj)
        } else if(key === "action") {
            entity[ key ] = new Action(game, entity, argObj)
        } else if(key === "terrain") {
            entity[ key ] = new Terrain(game, entity, argObj)
        } else {
            // entity[ key ] = new Component(game, entity, argObj);
            entity[ key ] = CreateComponent(comp, argObj);
        }
    }

    if(typeof callback === "function") {
        callback(entity);
    }

    return entity;
}

export function CreateComponent(schema, argObj = {}) {
    const [ value ] = Object.values(schema);

    if(typeof value === "function") {
        const obj = { ...argObj };
        for(let [ k, v ] of Object.entries(obj)) {
            if(typeof v === "function") {
                obj[ k ] = v();
            }
        }

        return value(obj);
    } else {
        return value;
    }
}

Entity.FromSchema = FromSchema;
Entity.CreateComponent= CreateComponent;

export default Entity;