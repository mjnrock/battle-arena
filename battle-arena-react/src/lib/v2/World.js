import Agency from "@lespantsfancy/agency";

import EntityManager from "./manager/EntityManager";
import { hasPosition as hasComponentPosition } from "./data/entity/components/position";

import Observer from "./util/Observer";
import Beacon from "./util/Beacon";
import NodeManager from "./manager/NodeManager";

export class World extends Beacon {
    constructor(width, height) {
        super();

        this.width = width;
        this.height = height;

        this.__entities = EntityManager.Generate(); // <Observer>-wrapped <Observable>
        this.__terrain = EntityManager.Generate();  // <Observer>-wrapped <Observable>

        this.__nodes = new NodeManager(this, this.__entities);  // Entities only

        //  To include entities and terrain
        // this.attach(this.__entities);
        // this.attach(this.__terrain);

        // this.__nodes = new NodeManager(this, this);
    }

    get entities() {
        return this.__entities.subject;
    }
    get terrain() {
        return this.__terrain.subject;
    }

    get nodes() {
        return this.__nodes.nodes;  // Agency..CrossMap
    }
    get node() {
        return this.__nodes.node;   // fn
    }
    get range() {
        return this.__nodes.range;  // fn
    }

    join(entity, ...synonyms) {
        if(!hasComponentPosition(entity)) {
            return false;
        }

        this.entities.register(entity, ...synonyms);

        return true;
    }
    leave(entity) {
        this.entities.unregister(entity);

        if(!this.__leaveNode(entity)) {
            this.__clearFromNodes(entity);
        }
        
        delete this._cache[ entity.__id ];
    }
}

export default World;