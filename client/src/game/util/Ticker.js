
import { Identity } from "../lib/Identity";
import { GroupRunner } from "./relay/GroupRunner";

export class Ticker extends Identity {
	constructor ({ fps = 24, begin, tick, end, ...opts } = {}) {
		super({ ...opts });

		this.events = new GroupRunner([
			"begin",
			"tick",
			"end",
		]);

		this.startedAt = null;
		this.lastUpdate = 0;
		this.ticks = 0;
		this.fps = fps;

		if(begin) {
			this.events.add("begin", begin);
		}
		if(tick) {
			this.events.add("tick", tick);
		}
		if(end) {
			this.events.add("end", end);
		}
	}

	get spf() {
		return 1000 / this.fps;
	}

	start() {
		this.ticks = 0;
		this.startedAt = Date.now();

		this.events.run("begin", {
			startedAt: this.startedAt,
			fps: this.fps,
		});

		this.loop = setInterval(() => {
			const now = Date.now();
			const dt = (now - this.lastUpdate) / 1000;

			if(dt >= this.spf * this.fps) {
				this.stop();
				this.start();
			}

			++this.ticks;
			
			this.events.run("tick", {
				now,
				dt,
				lastUpdate: this.lastUpdate,
				ticks: this.ticks,
				fps: this.fps,
			});

			this.lastUpdate = now;
		}, this.spf);

		return this;
	}
	stop() {
		clearInterval(this.loop);

		this.startedAt = null;
		this.events.run("end", );

		return this;
	}
};

export default Ticker;