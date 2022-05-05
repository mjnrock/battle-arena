import MainLoop from "mainloop.js";

import Agent from "./@agency/core/Agent";

export default class GameLoop extends Agent {
    constructor(fps = 24) {
		super({
			hooks: {
				pre: [
					Agent.Hooks.Traps.OnTrigger,
				]
			},
			state: {
				mainLoop: null,		// Placeholder
				ticks: 0,
				start: null,
				lastUpdate: null,
				lastDraw: null,
			},
			config: {
				generatePayload: false,
				allowMultipleHandlers: false,
				isReducer: false,
				allowRPC: false,
			},
		});

        this.state.mainLoop = MainLoop
            .setBegin(() => this.invoke("pre", this.spf, Date.now()))
            .setUpdate((dt) => {
				const now = Date.now();

				this.state.lastUpdate = now;
				++this.state.ticks;

				this.invoke("tick", dt, now);
			})
            .setDraw((ip) => {
				const now = Date.now();

				this.state.lastDraw = now;

				this.invoke("draw", this.spf * ip, now);
			})
            .setEnd((fps, panic) => this.invoke("post", fps, panic))
            .setSimulationTimestep(1000 / fps);
    }

    get fps() {
        return 1000 / this.state.mainLoop.getSimulationTimestep();
    }
    get spf() {
        return this.state.mainLoop.getSimulationTimestep() / 1000;
    }

    start() {
		this.state.ticks = 0;
        this.state.start = Date.now();		
        this.state.mainLoop.start();

        return this;
    }
    stop() {
        this.state.start = null;
        this.state.mainLoop.stop();

        return this;
    }
	
	pause() {
        if(this.loop.mainLoop.isRunning()) {
			this.state.mainLoop.stop();
		}

        return this;
	}
	resume() {
        if(!this.loop.mainLoop.isRunning()) {
			this.state.mainLoop.start();
		}

        return this;
	}

	restart() {		
		this.stop();

		this.state.lastUpdate = null;
		this.state.lastDraw = null;

		this.start();

		return this;
	}
}