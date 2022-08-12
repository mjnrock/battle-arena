
import { Identity } from "../lib/Identity";
import { Runner } from "./relay/Runner";

export class Ticker extends Identity {
	constructor ({ fps = 24, begin, tick, end, ...opts } = {}) {
		super({ ...opts });

		this.events = {
			begin: new Runner("begin"),
			tick: new Runner("tick"),
			end: new Runner("end"),
		};

		this.startedAt = null;
		this.lastUpdate = 0;
		this.ticks = 0;
		this.fps = fps;

		if(begin) {
			this.events.begin.add(begin);
		}
		if(tick) {
			this.events.tick.add(tick);
		}
		if(end) {
			this.events.end.add(end);
		}
	}

	get spf() {
		return 1000 / this.fps;
	}

	start() {
		this.ticks = 0;
		this.startedAt = Date.now();

		this.events.begin.run({
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
			
			this.events.tick.run({
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
		this.events.end.run();

		return this;
	}
};

export default Ticker;