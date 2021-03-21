import MainLoop from "mainloop.js";

// import Watchable from "./Watchable";
import Watchable from "@lespantsfancy/agency/src/v4/Watchable";

export class Pulse extends Watchable {
    constructor(bps = 30, { state = {}, deep = false, autostart = false } = {}) {
        super(state, { deep });

        this._bps = bps;
        this.tick = {};

        this.loop = MainLoop.setBegin(this.pre.bind(this))
            .setUpdate(this.update.bind(this))
            .setDraw(this.draw.bind(this))
            .setEnd(this.post.bind(this))
            .setSimulationTimestep(this.spb);

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

    start() {
        this.loop.start();

        return this;
    }
    stop() {
        this.loop.stop();

        return this;
    }

    /**
     * @param {number} ts Total elapsed time
     * @param {number} dt Frame delta in ms
     */
    pre(ts, dt) {}

    /**
     * @param {number} dt Frame delta in ms
     */
    update(dt) {
        this.tick = {
            dt,
            now: Date.now(),
        };
    }

    /**
     * @param {number} interpolationPercentage A factor between 0.0 and 1.0, used as a scaling weight similar to delta time
     */
    draw(interpolationPercentage) {
        // console.log("%", interpolationPercentage);   //TODO Figure out how to add these "rendering fractional steps" into implementation
    }

    post(fps, panic) {
        if (panic) {
            let discardedTime = Math.round(MainLoop.resetFrameDelta());
            console.warn("Main loop panicked, probably because the browser tab was put in the background. Discarding ", discardedTime, "ms");
        }
    }
};

export function Factory(bps, opts = {}) {
    return new Pulse(bps, opts);
};

Pulse.Factory = Factory;

export default Pulse;