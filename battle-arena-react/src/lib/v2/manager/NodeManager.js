import Agency from "@lespantsfancy/agency";

import Watcher from "./../util/Watcher";

import Entity from "../Entity";

export class NodeManager extends Watcher {
    constructor(size = [ 1, 1 ], ...watchables) {
        super([], {}, { deep: true });
        
        this._cache = {};
        this._watchables = watchables;

        this.nodes = Agency.Util.CrossMap.CreateGrid([ ...size ], { seedFn: () => new Set() });

        const _this = this;
        for(let watchable of watchables) {
            watchable.$.subscribe(function(prop, value) {
                if(prop.startsWith("position")) {
                    const entity = this.subject;
    
                    if(entity instanceof Entity) {
                        _this.moveToNode(entity);
                    }
                }
            });
        }
    }

    node(x, y) {
        return this.nodes.get(x, y);
    }
    /**
     * If [@centered=true], then consider @w and @h as radii
     */
    range(x, y, w, h, { asGrid = false, centered = false } = {}) {
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
                    row.push(this.node(i, j));
                }

                nodes.push(row);
            }
        } else {
            for(let j = y; j < y + h; j++) {
                for(let i = x; i < x + w; i++) {
                    nodes.push(this.node(i, j));
                }
            }
        }        

        return nodes;
    }

    joinNode(entity) {
        const node = this.nodes.get(entity.position.x, entity.position.y);

        if(node instanceof Set) {
            node.add(entity.$.proxy);
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
                node.delete(entity.$.proxy);
    
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
        for(let row of this.nodes.toLeaf()) {
            for(let cell of row) {
                if(cell instanceof Set) {
                    if(cell.delete(entity.$.proxy)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}

export default NodeManager;