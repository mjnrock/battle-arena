import { Identity } from "../../Identity";
import { Timer } from "./Timer";

/**
 * ? To build this out, invoke .Create and pass an equal-measure-score and a lookup spritesheet.
 */
export class Track extends Identity {
	constructor ({ sprites, cadence, id, tags, ...timer } = {}) {
		super({ id, tags });

		this.sprites = Array.from(sprites);
		this.timer = new Timer({
			cadence,
			start: true,
			...timer,
		});
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

	get current() {
		return this.sprites[ this.timer.current ][ 2 ];
	}
	next(time) {
		return this.timer.next(time);
	}

	/**
	 * Create a processed Track, based on the given spritesheet and score.
	 */
	static Create({ score, spritesheet } = {}) {
		const cadence = score.cadence.reduce((acc, step) => {
			acc = [ ...acc, step ];

			return acc;
		}, []);
		const notes = [];

		let i = 0;
		score.each(note => {
			/**
			 * Update the Note to contain the actual PIXI.Texture,
			 * instead of the alias.
			 */
			note.ref = spritesheet.get(note.ref);

			/**
			 * Add the note data to the notes array.
			 * [ index, duration, Texture ]
			 */
			notes.push([ i, cadence[ i ], note.ref ]);

			i += 1;
		});

		return new Track({
			sprites: notes,
			cadence,
		});
	}
};

export default Track;