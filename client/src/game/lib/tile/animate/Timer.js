import { Identity } from "../../../util/Identity";
import { Invoker } from "./../../../util/relay/Invoker";

/**
 * When in delta-mode, the Timer expects to be fed a delta-time in milliseconds.  In practice, this
 * .next invocation should happen from the Game's update method.  When the .next is invoked, the current
 * time will be used to calculate the appropriate index-offset, given the current time.  It can then be
 * queried for the current sprite index, to be linked with a Track.  When in timeout-mode, the Timer
 * will automatically invoke its .next method at the cadence of the current index.  When .next is
 * invoked, the next index will be calculated on the expiration of a setTimeout callback, set to the timeout
 * of the current index's duration, as per this.cadence[ this.current ].
 */
export class Timer extends Identity {
	/**
	 * Used as a static reference point for any Timer to use as a baseline point-in-time.
	 */
	static CoreTime = Date.now();

	constructor ({ start = false, loop = true, cadence = [], listeners = {}, isDelta = true, ...rest } = {}) {
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
			/**
			 * When TRUE, the Timer will expect .next to receive the current timestamp,
			 * so that it can calculate the appropriate index.
			 * When FALSE, the Timer will expect .next to receive nothing, and will instead
			 * begin (or continue) a setTimeout chain, that will continue (or not) based
			 * on config.loop.
			 */
			isDelta,
			start: null,
			loop: loop,
			timeout: null,
			duration: 0,
		};

		this.reset(cadence);
		this.parseListeners(listeners);

		if(start) {
			this.start(start);
		}
	}

	get elapsed() {
		return this.config.start ? Date.now() - this.config.start : 0;
	}
	get isRunning() {
		return this.config.start !== null;
	}

	/**
	 * A convenience method for parsing a listener object into a kvp list,
	 * using the key as the event name and the value as the listener(s).
	 */
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
	next(ts) {
		if(!this.isRunning) {
			this.current = 0;
			
			return;
		}

		if(this.config.isDelta) {
			ts = ts || Date.now();

			const remainder = (ts - this.config.start) % this.config.duration;

			//TODO Build a BinaryTree to find the correct index
			let index = 0;
			let acc = 0;
			for(let i = 0; i < this.cadence.length; i++) {
				let step = this.cadence[ i ];
				acc += step;

				if(remainder < acc) {
					index = i;
					break;
				}
			}

			this.current = index;
		} else {
			this.current += 1;

			if(this.current >= this.max) {
				this.current = 0;

				if(this.config.loop) {
					this.emit("loop");
				} else {
					this.stop();
				}

				this.emit("complete");
			}

			this.config.timeout = setTimeout(() => {
				this.next();
			}, this.cadence[ this.current ]);
		}

		this.emit("next");

		return this.current;
	}

	reset(cadence = []) {
		this.current = 0;
		this.max = cadence.length;
		this.cadence = cadence;

		this.config.duration = this.cadence.reduce((acc, cur) => acc + cur, 0);
	}

	start(ts) {
		if(this.config.start === null) {
			this.config.start = typeof ts === "number" ? ts : Date.now();
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