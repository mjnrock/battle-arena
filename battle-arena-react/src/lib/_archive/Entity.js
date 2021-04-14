import { v4 as uuidv4 } from "uuid";
import Agency from "@lespantsfancy/agency";
import Component from "./Component";

export default class Entity extends Agency.Registry {
    constructor(...components) {
        super();

        this._id = uuidv4();
        this.register(new Agency.Registry(), "components");

        this.gain(...components);

        this._born = Date.now();
    }

    get id() {
        return this._id;
    }

    getComp(type) {
        const comp = this.get("components").getBySynonym(type);

        if(comp instanceof Component) {
            return comp;
        }
    }

    gain(...components) {
        for(let component of components) {
            this.components.register(component, component.type);
        }

        return this;
    }
    lose(...components) {
        for(let component of components) {
            this.components.unregister(component);
        }

        return this;
    }
    reset() {
        this.components = new Agency.Registry();

        return this;
    }

    static FromSchema(schemaOrObj, schemaParamObject = {}) {
        let entity = new Entity();
        for(let [ key, value ] of Object.entries(schemaOrObj)) {
            if(typeof value === "function") {
                entity.gain(new Component(key, value(...(schemaParamObject[ key ] || []))));
            } else {
                entity.gain(new Component(key, value));
            }
        }
    
        return entity;
    }
}