import Agency from "@lespantsfancy/agency";

import Terrain from "./component/Terrain";
import World from "./component/World";
import Action from "./component/Action";
import Component from "./component/Component";
import Health from "./component/Health";
import Meta from "./component/Meta";

export class Entity extends Agency.Event.Network {
    constructor(game) {
        super();
        
        this.__game = game;

        this.addHandler("interaction", function(...args) {
            console.log(this.provenance);
            console.log(...args);
        });
        this.addSubscriber((...args) => console.log(...args));

        return new Proxy(this, {
            set(target, prop, value) {
                if(value == null && target[ prop ] instanceof Component) {
                    target.leave(target[ prop ]);
                } else if(prop === "action" && value instanceof Component) {
                    target.join(value);
                }

                return Reflect.set(target, prop, value);
            },
            deleteProperty(target, prop) {
                if(target[ prop ] instanceof Component) {
                    target.leave(target[ prop ]);
                }

                return Reflect.deleteProperty(target, prop);
            },
        });
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