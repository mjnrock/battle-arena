import { Identity } from "../../../util/Identity";
import { Timer } from "./Timer";

/**
 * This basically is a highly simplified version of the Track-Score-Spritesheet
 * paradigm that can be used to create a equally-timed animations with a lookup
 * table of sprite textures.  This will set the cadence to the length of the
 * longest animation, determined by a simple path count.
 */
export class Composition extends Identity {
	constructor ({ sprites = {}, timestep, path, id, tags, ...timer } = {}) {
		super({ id, tags });

		this.sprites = new Map(sprites);

		this.timer = new Timer({
			cadence: this.update(timestep),
			...timer,
		});

		/**
		 * This is the current sprite path, absent the index.
		 * e.g. "squirrel.normal.east"
		 */
		this.path = path;
	}

	update(timestep) {
		let counter = {},
			arr = [];

		for(let [ alias, texture ] of this.sprites) {
			let words = alias.split(".");
			let last = words.pop();
			let path = words.join(".");

			if(path.length) {	
				if(path in counter) {
					counter[ path ] += 1;
				} else {
					counter[ path ] = 1;
				}
	
				if(counter[ path ] > arr.length) {
					arr.push(timestep);
				}
			}
		}

		return arr;
	}

	setIsTimeout(start = false) {
		this.timer.stop();
		this.timer.setIsTimeout();

		if(start) {
			this.timer.start();
		}

		return this;
	}
	setIsDelta() {
		this.timer.stop();
		this.timer.setIsDelta();

		return this;
	}

	/**
	 * Assign or evaluate the current path, using the Timer to
	 * determine the index.
	 */
	current(...pathArgs) {
		let path = typeof this.path === "function" ? this.path(...pathArgs) : this.path;
		let alias = `${ path }.${ this.timer.current }`;
		
		if(this.sprites instanceof Map) {
			return this.sprites.get(alias);
		} else if(typeof this.sprites === "object") {
			return this.sprites[ alias ];
		}

		return false;
	}
	next(time) {
		return this.timer.next(time);
	}
	
	/**
	 * Create a processed Track, based on the given spritesheet and score.
	 */
	static Create({ spritesheet, timestep, path, autoPlay = false } = {}) {
		return new Composition({
			sprites: spritesheet.textures,
			timestep: timestep,
			path: path,
			start: autoPlay,
		});
	}
};

export default Composition;