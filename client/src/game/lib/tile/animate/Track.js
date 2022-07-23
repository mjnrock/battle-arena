import Timer from "./Timer";

//TODO Build out the .Create method, as that should be the primary way to create a Track (which is basically just a data frame)
/**
 * ? To build this out, invoke .Create and pass an equal-measure-score and a lookup spritesheet.
 */
export class Track {
	constructor({ sprites, cadence, type } = {}) {
		this.sprites = Array.from(sprites);
		this.ticker = new Timer({
			type,
			cadence,
		});

		if(type === "timeout") {
			this.ticker.start();
		}
	}

	setIsTimeout(start = false) {
		this.ticker.stop();
		this.ticker.setIsTimeout();

		if(start) {
			this.ticker.start();
		}

		return this;
	}
	setIsDelta() {
		this.ticker.stop();
		this.ticker.setIsDelta();

		return this;
	}

	get current() {
		//TODO Build the reference with this.sprites and this.cadence
		return this.ticker.current;
	}
	next(time) {
		return this.ticker.next(time);
	}

	static Create({ score, spritesheet } = {}) {
	}
};

export default Track;