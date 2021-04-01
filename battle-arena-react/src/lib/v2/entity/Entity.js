import { v4 as uuidv4 } from "uuid";
import Terrain from "./component/Terrain";
import World from "./component/World";
import Action from "./component/Action";
import Component from "./component/Component";

export class Entity {
    constructor(game) {
        this.__id = uuidv4();
        this.__game = game;
    }

    [ Symbol.iterator ]() {
        var index = -1;
        var data = Object.keys(this).reduce((a, key) => {
            if(this[ key ] instanceof Component) {
                return [ ...a, this[ key ] ];
            }

            return a;
        }, []);

        return {
            next: () => ({ value: data[ ++index ], done: !(index in data) })
        };
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