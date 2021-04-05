import Agency from "@lespantsfancy/agency";

import Terrain from "./component/Terrain";
import World from "./component/World";
import Action from "./component/Action";
import Component from "./component/Component";
import Health from "./component/Health";
import Meta from "./component/Meta";

export class Entity extends Agency.Event.Emitter {
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

/**
 * 
 * @param {[ [ componentFn, argObj ], ... ]} schemaWithArgs 
 * @param {fn} callback | Useful for post-init/circular assignments
 * @returns 
 */
export function FromSchema(game, schemaWithArgs = {}, callback) {
    let entity = new Entity(game);

    for(let [ key, argObj ] of Object.entries(schemaWithArgs)) {
        const fn = Agency.Registry._.component[ key ];
        if(typeof fn === "function") {
            const component = fn(game, entity, argObj);

            if(component instanceof Component) {
                entity[ key ] = component;
            }
        }
    }

    if(typeof callback === "function") {
        callback(entity);
    }

    return entity;
}

Entity.FromSchema = FromSchema;

export default Entity;