import MainLoop from "mainloop.js";

import Agent from "./@agency/core/Agent";

export default class GameLoop extends Agent {
    constructor(fps = 24) {
		super({
			state: {
				mainLoop: null,		// Placeholder
				start: null,
				lastUpdate: null,
				lastDraw: null,
			},
			config: {
				generatePayload: false,
				allowMultipleHandlers: false,
				isReducer: false,
				allowRPC: false,
			}
		});

		this.addTriggers({
			pre: this.onPreTick,
			tick: this.onTick,
			post: this.onPostTick,
			draw: this.onDraw,
		});

        this.state.mainLoop = MainLoop
            .setBegin(() => this.invoke("pre", this.spf, Date.now()))
            .setUpdate((dt) => this.invoke("tick", dt, Date.now()))
            .setDraw((ip) => this.invoke("post", this.spf * ip, Date.now()))
            .setEnd((fps, panic) => this.invoke("draw", fps, panic))
            .setSimulationTimestep(1000 / fps);
    }

    get fps() {
        return 1000 / this.state.mainLoop.getSimulationTimestep();
    }
    get spf() {
        return this.state.mainLoop.getSimulationTimestep() / 1000;
    }

    start() {
        this.state.start = Date.now();
        this.state.mainLoop.start();

        return this;
    }
    stop() {
        this.state.start = null;
        this.state.mainLoop.stop();

        return this;
    }

    // setPreTick(fn) {
    //     this.state.mainLoop.setBegin(() => {
    //         let now = Date.now();

    //         fn.call(this, this.spf, now);
    //     });

    //     return this;
    // }
    // setTick(fn) {
    //     this.state.mainLoop.setUpdate((dt) => {
    //             dt /= 1000;
    //         let now = Date.now();

    //         this.state.lastUpdate = now;
    //         fn.call(this, dt, now);
    //     });

    //     return this;
    // }
    // setDraw(fn) {
    //     this.state.mainLoop.setDraw((ip) => {
    //         let dt = this.spf * ip,  // @24fps --> (41.7 / 1000 * [0,1])
    //             now = Date.now();

    //         this.state.lastDraw = now;
    //         fn.call(this, dt, now);
    //     });

    //     return this;
    // }
    // setEnd(fn) {
    //     this.state.mainLoop.setEnd((fps, panic) => {
    //         fn.call(this, fps, panic);
    //     });

    //     return this;
    // }

    onPreTick(dt, now) {	}
    onTick(dt, now) {
		console.log("TICK", dt, now)
	}
    onPostTick(dt, now) {	}

    onDraw(fps, panic) {}
}