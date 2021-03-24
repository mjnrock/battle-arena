import Agency from "@lespantsfancy/agency";
import Watchable from "./util/Watchable";

export class Entity extends Watchable {
    constructor() {
        super();
    }
}

//? A <Component> schema should only ever have ONE (1) entry i.e. { [_name]: { ...} }
/**
 * 
 * @param {[ [ componentFn, argObj ], ... ]} schemaWithArgs 
 * @param {fn} callback | Useful for post-init/circular assignments
 * @returns 
 */
export function FromSchema(schemaWithArgs = [], callback) {
    let entity = new Entity();

    for(let [ comp, argObj ] of schemaWithArgs) {        
        const key = Object.keys(comp)[ 0 ];
        entity[ key ] = CreateComponent(comp, argObj);
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