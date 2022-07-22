import { Identity } from "./../../Identity";
import { Invoker } from "../../relay/Invoker";

export class Timer extends Identity {
	constructor ({ start = false, loop = true, cadence = [], listeners = {}, ...rest } = {}) {
		super({ ...rest });

		this.current = 0;
		this.max = 0;
		this.cadence = [];

		this.events = {
			start: new Invoker(),
			stop: new Invoker(),
			next: new Invoker(),
			loop: new Invoker(),
			complete: new Invoker(),
		};

		this.config = {
			type: "timeout", 	// "timeout" or "delta"
			start: null,
			loop: loop,
			timeout: null,
		};

		this.reset(cadence);
		this.parseListeners(listeners);
		if(start) {
			this.start();
		}
	}

	get elapsed() {
		return this.config.start ? Date.now() - this.config.start : 0;
	}
	get isRunning() {
		return this.config.start !== null;
	}

	parseListeners(obj) {
		for(const key in obj) {
			if(obj.hasOwnProperty(key)) {
				const listener = obj[ key ];

				if(typeof listener === "function") {
					this.events[ key ].add(listener);
				} else if(Array.isArray(listener)) {
					listener.forEach(l => this.events[ key ].add(l));
				}
			}
		}
	}

	emit(event) {
		this.events[ event ].run({
			current: this.current,
			id: this.id,
			elapsed: this.elapsed,
		});
	}
	next() {
		this.current += 1;

		if(this.current >= this.max) {
			if(this.config.loop) {
				this.current = 0;
				
				this.emit("loop");
			} else {
				this.current = -1;	
				this.stop();
			}
			
			this.emit("complete");
		}

		this.emit("next");

		if(this.config.type === "timeout") {
			this.config.timeout = setTimeout(() => {
				this.next();
			}, this.cadence[ this.current ]);
		} else if(this.config.type === "delta") {
			//TODO
		}

		return this.current;
	}

	reset(cadence = []) {
		this.current = -1;
		this.max = cadence.length;
		this.cadence = cadence;
	}

	start() {
		if(this.config.start === null) {
			this.config.start = Date.now();
			this.emit("start");
			
			this.next();
		}
	}
	stop() {
		clearTimeout(this.config.timeout);
		this.config.start = null;
		this.emit("stop");
	}
};

export default Timer;