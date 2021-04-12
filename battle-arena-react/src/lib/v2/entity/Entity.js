import Agency from "@lespantsfancy/agency";

import Component from "./component/Component";
import { Accessor as ComponentRegistry} from "./component/_init";

//TODO  Add a @escalate function to <Entity> via <EntityManager>, akin to <Node> setup
export class Entity extends Agency.Event.Emitter {
    constructor(game, opts = {}) {
        super({}, opts);
        
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

    __destroy() {
        for(let key in this) {
            if(this[ key ] instanceof Component) {
                this[ key ].__destroy();
            }
        }

        this.__deconstructor();
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
    let entity = new Entity(game, "terrain" in schemaWithArgs ? { injectMiddleware: false } : {});

    for(let [ key, argObj ] of Object.entries(schemaWithArgs)) {
        const fn = ComponentRegistry(key);
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