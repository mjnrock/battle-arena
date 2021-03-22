import Agency from "@lespantsfancy/agency";

import Watcher from "./../util/Watcher";

export class NodeManager extends Watcher {
    constructor(size = [ 1, 1 ], ...watchables) {
        super([], {}, { deep: false });
        
        this.__cache = {};
        this.nodes = Agency.Util.CrossMap.CreateGrid([ ...size ], { seedFn: () => new Set() });
        console.log(this.nodes)

        for(let watchable of watchables) {
            watchable.$.subscribe(this);
        }
    }

    node(x, y) {
        console.log(this.nodes, this.nodes.get(0, 0))
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

    __joinNode(entity) {
        const node = this.nodes.get(entity.position.x, entity.position.y);

        if(node instanceof Set) {
            node.add(entity);
            this.__cache[ entity.__id ] = {
                x: entity.position.x,
                y: entity.position.y,
            };

            return true;
        }

        return false;
    }
    __leaveNode(entity) {
        const { x, y } = this.__cache[ entity.__id ] || {};
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
    __moveToNode(entity) {
        this.__leaveNode(entity);
        this.__joinNode(entity);

        return this;
    }
    __clearFromNodes(entity) {
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
}

export default NodeManager;