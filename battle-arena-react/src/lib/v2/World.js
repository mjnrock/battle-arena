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

        this._cache = {};
        this.nodes = Agency.Util.CrossMap.CreateGrid([ height, width ], { seedFn: () => new Set() });

        this.on("position.x", (value, entity) => this.moveToNode(entity));
        this.on("position.y", (value, entity) => this.moveToNode(entity));

        this.attach(new Observer(this.entities));
        this.attach(new Observer(this.terrain));
    }

    /**
     * If [@centered=true], then consider @w and @h as radii
     */
    getNodes(x, y, w, h, { asGrid = false, centered = false } = {}) {
        const nodes = [];

        if(centered) {  // Refactor values to become center point and radii
            x -= w;
            y -= h;
            w *= 2;
            h *= 2;
            w += 1;
            h += 1;
        }

        if(asGrid) {
            for(let j = y; j < y + h; j++) {
                let row = [];
                for(let i = x; i < x + w; i++) {
                    row.push(this.getNode(i, j));
                }

                nodes.push(row);
            }
        } else {
            for(let j = y; j < y + h; j++) {
                for(let i = x; i < x + w; i++) {
                    nodes.push(this.getNode(i, j));
                }
            }
        }        

        return nodes;
    }
    getNode(x, y) {
        return this.nodes.get(x, y);
    }
    joinNode(entity) {
        const node = this.nodes.get(entity.position.x, entity.position.y);

        if(node instanceof Set) {
            node.add(entity);
            this._cache[ entity.__id ] = {
                x: entity.position.x,
                y: entity.position.y,
            };

            return true;
        }

        return false;
    }
    leaveNode(entity) {
        const { x, y } = this._cache[ entity.__id ] || {};
        if(x !== void 0 && y !== void 0) {
            const node = this.nodes.get(x, y);
    
            if(node instanceof Set) {
                node.delete(entity);
    
                return true;
            }

            return false;
        }

        return false;
    }
    moveToNode(entity) {
        this.leaveNode(entity);
        this.joinNode(entity);

        return this;
    }
    clearFromNodes(entity) {
        console.log(32432)
        for(let row of this.nodes.toLeaf()) {
            for(let cell of row) {
                if(cell instanceof Set) {
                    if(cell.delete(entity)) {
                        return true;
                    }
                }
            }
        }

        return false;
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

        if(!this.leaveNode(entity)) {
            this.clearFromNodes(entity);
        }
        
        delete this._cache[ entity.__id ];
    }
}

export default World;