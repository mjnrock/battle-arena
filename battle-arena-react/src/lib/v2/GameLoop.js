import MainLoop from "mainloop.js";

export default class GameLoop {
    constructor(fps = 24) {
        this.loop = MainLoop
            .setBegin(this.onPreTick)
            .setUpdate(this.onTick)
            .setDraw(this.onDraw)
            .setSimulationTimestep(1000 / fps);
    }

    get fps() {
        return this.loop.getSimulationTimestep();
    }
    get spf() {
        return 1000 / this.fps;
    }

    start() {
        this.loop.start();

        return this;
    }
    stop() {
        this.loop.stop();

        return this;
    }

    setPreTick(fn) {
        this.loop.setBegin(fn.bind(this));

        return this;
    }
    setTick(fn) {
        this.loop.setUpdate(fn.bind(this));

        return this;
    }
    setDraw(fn) {
        this.loop.setDraw(fn.bind(this));

        return this;
    }

    onPreTick(dt, now) {}
    onTick(dt, now) {}

    onDraw(dt, now) {}
}