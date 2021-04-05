import MainLoop from "mainloop.js";

export default class GameLoop {
    constructor(fps = 24) {
        this.mainLoop = MainLoop
            .setBegin(this.onPreTick)
            .setUpdate(this.onTick)
            .setDraw(this.onDraw)
            .setEnd(this.onPostTick)
            .setSimulationTimestep(1000 / fps);

        this.__start = null;
        this.__lastUpdate = null;
        this.__lastDraw = null;
    }

    get fps() {
        return this.mainLoop.getSimulationTimestep();
    }
    get spf() {
        return 1000 / this.fps;
    }

    start() {
        this.__start = Date.now();
        this.mainLoop.start();

        return this;
    }
    stop() {
        this.__start = null;
        this.mainLoop.stop();

        return this;
    }

    setPreTick(fn) {
        this.mainLoop.setBegin(() => {
            let now = Date.now();

            fn.call(this, this.spf, now);
        });

        return this;
    }
    setTick(fn) {
        this.mainLoop.setUpdate((dt) => {
                dt /= 1000;
            let now = Date.now();

            this.__lastUpdate = now;
            fn.call(this, dt, now);
        });

        return this;
    }
    setDraw(fn) {
        this.mainLoop.setDraw((ip) => {
            let dt = this.spf * ip,  // @24fps --> (41.7 / 1000 * [0,1])
                now = Date.now();

            this.__lastDraw = now;
            fn.call(this, dt, now);
        });

        return this;
    }
    setEnd(fn) {
        this.mainLoop.setEnd((fps, panic) => {
            fn.call(this, fps, panic);
        });

        return this;
    }

    onPreTick(dt, now) {}
    onTick(dt, now) {}
    onPostTick(dt, now) {}

    onDraw(dt, now) {}
}