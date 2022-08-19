import { Identity } from "../../Identity";
import { Timer } from "./Timer";

export class Track extends Identity {
	constructor ({ sprites, cadence, id, tags, ...timer } = {}) {
		super({ id, tags });

		this.sprites = Array.from(sprites);
		this.timer = new Timer({
			cadence,
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
		try {
			return this.sprites[ this.timer.current ][ 2 ];
		} catch(e) {
			throw new Error(`Your Track threw a null-pointer exception because it has no Measures -- check your initializations.`);
		}
	}
	next(time) {
		return this.timer.next(time);
	}

	/**
	 * Create a processed Track, based on the given spritesheet and score.
	 */
	static Create({ score, spritesheet, autoPlay = false, writeback = false } = {}) {
		const notes = [];
		score.each((note, i) => {
			/**
			 * Optionally write the SpriteSheet's version of the Note (e.g. Texture) *back* into the Note.ref
			 */
			if(writeback === true && typeof note.ref === "string") {
				note.ref = spritesheet.get(note.ref);
			}

			/**
			 * Add the note data to the notes array.
			 * [ index, duration, Texture ]
			 */
			notes.push([ i, score.cadence[ i ], spritesheet.get(note.ref) ]);
		});

		return new Track({
			sprites: notes,
			cadence: [ ...score.cadence ],
			start: autoPlay,
		});
	}
};

export default Track;


/**
 * * EXAMPLE
 * 
 * const tessellator = Tessellator.FromCanvas({
		alias: "squirrel",
		canvas: assets.entity_squirrel,
		algorithm: Tessellator.Algorithms.GridBased,
		args: [ { tw: 32, th: 32 } ],
	});

	const spritesheet = new SpriteSheet({
		tileset: tessellator.tileset,
	});

	const squirrelScore = Score.FromArray([
		[ "squirrel.normal.north.0", "squirrel.normal.north.1" ],
		[ "squirrel.normal.east.0", "squirrel.normal.east.1" ],
		[ "squirrel.normal.south.0", "squirrel.normal.south.1" ],
		[ "squirrel.normal.west.0", "squirrel.normal.west.1" ],
	]);

	const track = Track.Create({
		score: squirrelScore,
		spritesheet,
		autoPlay: true,
	});

	// console.log(tessellator);
	// console.log(spritesheet);
	// console.log(squirrelScore);
	// console.log(track);

	entity.animation.sprite.texture = track.current;
	entity.animation.track = track;
 */