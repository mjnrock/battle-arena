import AgencyBase from "@lespantsfancy/agency/src/AgencyBase";

import Terrain from "./component/Terrain";
import World from "./component/World";
import Action from "./component/Action";
import Component from "./component/Component";
import Health from "./component/Health";
import Meta from "./component/Meta";

export class Entity extends AgencyBase {
    constructor(game) {
        super();
        
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
        } else if(key === "health") {
            entity[ key ] = new Health(game, entity, argObj)
        } else if(key === "meta") {
            entity[ key ] = new Meta(game, entity, argObj)
        } else if(key === "terrain") {
            entity[ key ] = new Terrain(game, entity, argObj)
        }
    }

    if(typeof callback === "function") {
        callback(entity);
    }

    return entity;
}

Entity.FromSchema = FromSchema;

export default Entity;