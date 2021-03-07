import Agency from "@lespantsfancy/agency";

import EntityManager from "./manager/EntityManager";
import { hasPosition as hasComponentPosition } from "./data/entity/components/position";

import Observer from "./util/Observer";
import Beacon from "./util/Beacon";

export class World extends Beacon {
    constructor(width, height) {
        super();

        this.width = width;
        this.height = height;

        this.entities = new EntityManager();
        this.terrain = new EntityManager();

        // this.entityWatcher = new Observer(this.entities);
        // this.entityWatcher.on("position.x", (value, entity) => console.log(`x`, value, entity.__id));
        // this.entityWatcher.on("position.y", (value, entity) => console.log(`y`, value, entity.__id));
        // this.entityWatcher.on("position.y", console.log);
        // this.terrainWatcher = new Agency.Observer(this.terrain);
        // this.terrainWatcher.on("position.x", console.log);
        // this.terrainWatcher.on("position.y", console.log);

        // this.attach(new Observer(this.entities));
        this.attach(new Observer(this.terrain));
        // this.attach(this.terrainWatcher);

        this.on("position.x", (value, entity) => console.log(`x`, value, entity.__id));
        this.on("position.y", (value, entity) => console.log(`y`, value, entity.__id));
        // this.entityWatcher.on("position.x", (value, entity) => console.log(`x`, value, entity.__id));
        // this.on("position.x", (...args) => console.log(...args));
        // this.entityWatcher.on("position.x", (...args) => console.log(...args));
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
    }
}

export default World;