import MainLoop from "mainloop.js";
import Emitter from "./Emitter";
import AgencyWatcher from "./Watcher";

export function preUpdate(ts, dt) {};
export function postUpdate(fps, panic) {
    if (panic) {
        let discardedTime = Math.round(MainLoop.resetFrameDelta());
        console.warn("Main loop panicked, probably because the browser tab was put in the background. Discarding ", discardedTime, "ms");
    }
};

export class Pulse extends Emitter {
    static Events = [
        "tick",
    ];

    constructor(bps = 30, { state = {}, deep = false, autostart = false, pre, post, ...opts } = {}) {
        super(Pulse.Events, { state, deep, ...opts });

        this._bps = bps;
        this.tick = {};
        this.__ticks = 0;

        this.loop = MainLoop.setBegin(preUpdate.bind(this))
            .setUpdate(this.update.bind(this))
            .setDraw(this.draw.bind(this))
            .setEnd(postUpdate.bind(this))
            .setSimulationTimestep(this.spb);

        this.pre = pre;
        this.post = post;

        if(autostart) {
            this.start();
        }
    }

    get bps() {
        return this._bps;
    }
    set bps(fps) {
        this._bps = fps;

        if(this.loop.isRunning()) {
            this.stop();
            this.start();
        }
    }
    get spb() {
        return 1000 / this.bps;
    }

    get ticks() {
        return this.__ticks;
    }

    start() {
        this.loop.start();

        return this;
    }
    stop() {
        this.loop.stop();

        return this;
    }
    
    get pre() {
        return this._pre;
    }
    set pre(fn) {
        if(typeof fn === "function") {
            this._pre = fn;

            this.loop.setBegin(this.pre);
        }
    }
    
    get post() {
        return this._post;
    }
    set post(fn) {
        if(typeof fn === "function") {
            this._post = fn;

            this.loop.setEnd(this.post);
        }
    }

    /**
     * @param {number} dt Frame delta in ms
     */
    update(dt) {
        ++this.__tick;

        this.$tick(dt, Date.now());
    }

    /**
     * @param {number} interpolationPercentage A factor between 0.0 and 1.0, used as a scaling weight similar to delta time
     */
    draw(interpolationPercentage) {
        // console.log("%", interpolationPercentage);   //TODO Figure out how to add these "rendering fractional steps" into implementation
    }
};

export function Factory(bps, opts = {}) {
    return new Pulse(bps, opts);
};

export function Watcher(bps, opts = {}) {
    const pulse = new Pulse(bps, opts);
    const watcher = new AgencyWatcher();

    watcher.$.watch(pulse);

    return watcher;
};

Pulse.Factory = Factory;
Pulse.Watcher = Watcher;

export default Pulse;