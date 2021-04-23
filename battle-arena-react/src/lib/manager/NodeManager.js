import Agency from "@lespantsfancy/agency";

import Node from "./../world/lib/Node";

export class NodeManager extends Agency.Event.Emitter {
    //!GRID-NUDGE
    // static Extractor = function(entity) { return [ Agency.Util.Helper.round(entity.world.x, 1), Agency.Util.Helper.round(entity.world.y, 1) ] };
    static Extractor = function(entity) { return [ ~~entity.world.x, ~~entity.world.y ] };

    constructor(size = [ 1, 1 ], { extractor } = {}) {
        super({}, { injectMiddleware: true });

        this._cache = new WeakMap();

        this._nodes = Agency.Util.CrossMap.CreateGrid(size, {
            seedFn: (...coords) => new Node(coords, { escalate: this.escalation.bind(this) }),
        });

        this.__extractor = extractor;
    }

    escalation(node, event, ...args) {
        this.$.emit(event, node, ...args);
    }

    get extractor() {
        if(typeof this.__extractor === "function") {
            return this.__extractor.bind(this);
        }
        
        return NodeManager.Extractor.bind(this);
    }
    get nodes() {
        return this._nodes;
    }
    get cache() {
        return this._cache;
    }

    cached(entity) {
        return this.cache.get(entity);
    }
    extract(entity) {
        return this.nodes.get(...this.extractor(entity));
    }

    updateCache(entity, x, y) {
        this.cache.set(entity, [ x, y ]);

        return this;
    }

    move(entity) {
        const pos = this.cached(entity) || [];
        const leaveNode = this.node(...pos);
        const joinNode = this.extract(entity);

        if(leaveNode !== joinNode) {
            if(leaveNode instanceof Node) {
                leaveNode.leave(entity);
            }
            if(joinNode instanceof Node) {
                joinNode.join(entity);

                this.updateCache(entity, joinNode.x, joinNode.y);
            }
        }

        return this;
    }
    remove(entity) {
        const pos = this.cached(entity) || [];
        const cacheNode = this.node(...pos);
        const posNode = this.extract(entity);

        const leaver = node => node instanceof Node && node.leave(entity);

        if(cacheNode instanceof Node) {
            if(cacheNode.leave(entity)) {
                return true;
            } else if(posNode instanceof Node) {
                if(posNode.leave(entity)) {
                    return true;
                }
            }
        }

        if(leaver(cacheNode)) {
            return true;
        } else if(leaver(posNode)) {
            return true;
        }
        
        return this.findAndRemove(entity);
    }
    findAndRemove(entity) {
        const nodes = this.nodes.toLeaf({ flatten: true });
        for(let node of nodes) {
            if(node.leave(entity)) {
                return true;
            }
        }

        return false;
    }

    node(...pos) {
        return this.nodes.get(...pos);
    }

    clearCache() {
        this._cache = new WeakMap();

        return this;
    }
    clearOccupants() {
        for(let node of this.nodes.toLeaf({ flatten: true })) {
            node.clearOccupants();
        }

        return this;
    }

    /**
     * If [@centered=true], then consider @w and @h as radii
     */
    range(x, y, w, h, { asGrid = false, centered = false } = {}) {
        const nodes = [];

        x = Agency.Util.Helper.round(x, 1);
        y = Agency.Util.Helper.round(y, 1);

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
}

export default NodeManager;