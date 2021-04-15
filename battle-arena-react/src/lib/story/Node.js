import Agency from "@lespantsfancy/agency";

import drawEntityLayer from "./../data/render/world-entity-layer";
import drawTerrainLayer from "./../data/render/world-terrain-layer";
import drawUILayer from "./../data/render/world-ui-layer";

export const GameNode = (...rest) => new Node({
    loop: {
        pre: function(spf, now) {
            for(let world of this.world) {
                world.onPreTick(spf, now);
            }
            // this.world.current.onPreTick(spf, now);
        },
        tick: function(dt, now) {
            for(let world of this.world) {
                world.onTick(dt, now);
            }
            // this.world.current.onTick(dt, now);
        },
        post: function(fps, panic) {
            if(panic) {
                console.warn(`MainLoop has panicked, resulting in ${ fps }fps.  Dropping all queued events on 'default' <Network>.`)
                Agency.Event.Network.$.emptyAll();
                this.loop.mainLoop.resetFrameDelta();
            }
            
            Agency.Event.Network.$.processAll();
        },
    
        //TODO  Adjust cursor positions if <Camera> is not rendering entire map
        //TODO  Break down ...drawImageArgs in each layer for render optimizations | maybe use a minecraft model where a <Creator> must be within X range of a <Node> to render/tick
        draw: function(dt, now) {
            this.render.drawAnimationLayers(dt, now, ...this.render.camera.drawArgs);
        },
    },

    layers: [
        drawTerrainLayer,
        drawEntityLayer,
        drawUILayer,
    ],
    ...rest,
});

export class Node {
    constructor({ children = {}, next, loop = {}, layers = [] } = {}) {
        this.children = children;
        this.loop = loop;
        this.layers = new Set(layers);
        this.next = next;
        this.isComplete = false;
    }

    markComplete(next) {
        this.next = next;
        this.isComplete = true;

        return this;
    }

    attach(game) {
        const _this = this;

        game.loop.setPreTick(function(...args) {
            _this.loopHook.call(_this, game, "pre", ...args);
        });
        game.loop.setTick(function(...args) {
            _this.loopHook.call(_this, game, "tick", ...args);
        });
        game.loop.setEnd(function(...args) {
            _this.loopHook.call(_this, game, "post", ...args);
        });
        game.loop.setDraw(function(...args) {
            _this.loopHook.call(_this, game, "draw", ...args);
        });

        game.render.removeAllLayers();
        for(let layerDrawFn of this.layers) {
            game.render.addAnimationLayers(layerDrawFn);
        }

        return this;
    }
    detach(game) {
        game.loop.setPreTick(() => {});
        game.loop.setTick(() => {});
        game.loop.setEnd(() => {});
        game.loop.setDraw(() => {});

        game.render.removeAllLayers();

        return this;
    }
    
    loopHook(game, key, ...args) {
        if(typeof this.loop[ key ] === "function") {
            this.loop[ key ].call(game, ...args);
        }

        for(let node of Object.values(this.children)) {
            if(node instanceof Node) {
                if(typeof node.loop[ key ] === "function") {
                    node.loop[ key ].loopHook.call(node, game, key, ...args);
                }
            }
        }

        if(key === "post") {
            if(this.isComplete) {
                this.detach(game);
                game.current = this.next;
            }
        }
    }
};

export default Node;



export const TestNode = (...rest) => new Node({
    loop: {
        pre: function(spf, now) {
            for(let world of this.world) {
                world.onPreTick(spf, now);
            }
            // this.world.current.onPreTick(spf, now);
        },
        tick: function(dt, now) {
            for(let world of this.world) {
                world.onTick(dt, now);
            }
            // this.world.current.onTick(dt, now);
        },
        post: function(fps, panic) {
            if(panic) {
                console.warn(`MainLoop has panicked, resulting in ${ fps }fps.  Dropping all queued events on 'default' <Network>.`)
                Agency.Event.Network.$.emptyAll();
                this.loop.mainLoop.resetFrameDelta();
            }
            
            Agency.Event.Network.$.processAll();
        },
    
        //TODO  Adjust cursor positions if <Camera> is not rendering entire map
        //TODO  Break down ...drawImageArgs in each layer for render optimizations | maybe use a minecraft model where a <Creator> must be within X range of a <Node> to render/tick
        draw: function(dt, now) {
            this.render.drawAnimationLayers(dt, now, ...this.render.camera.drawArgs);
        },
    },

    layers: [
        drawTerrainLayer,
        drawUILayer,
    ],
    ...rest,
});