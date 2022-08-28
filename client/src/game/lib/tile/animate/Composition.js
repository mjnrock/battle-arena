import Collection from "../../../util/Collection";
import Track from "./Track";

export class Zone {
	constructor (x, y, w = true, h = true) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}
};

/**
 * The Composition extends Track to put sprite images into a grid with named-boundary zones for dynamic, relative positioning for a given Score.
 * This is useful for SpriteSheets that contain multiple Entity "states" in patterned zones.
 */
export class Composition extends Track {
	constructor ({ zones, ...opts } = {}) {
		super({ ...opts });

		/**
		 * This changes the way the SpriteSheet is read, causing all
		 * queries to be resolved by accounting for the offset and
		 * boundaries of the current Zone.
		 * 
		 * This is useful for things like Game Entity "state" changes (e.g. NORMAL, MOVING, etc.)
		 * where the Score could be reused, but the tessellation X,Y
		 * numbers need to be adjusted with a relative offset.
		 */
		this.zones = new Collection(zones);
	}

	//TODO: Modify the Track to accomodate Zones

	get current() {
		try {
			// return this.sprites[ this.timer.current ][ 2 ];
			return this.sprites[ this.timer.current ][ 2 ]();
		} catch(e) {
			throw new Error(`Your Track threw a null-pointer exception because it has no Measures -- check your initializations.`);
		}
	}
	next(time, ...args) {
		if(args.length) {
			this.zones.curate(...args);
		}

		return this.timer.next(time);
	}

	/**
	 * Create a processed Track, based on the given spritesheet and score.
	 */
	static Create({ score, spritesheet, zones, autoPlay = false, writeback = false } = {}) {
		const notes = [];
		const composition = new Composition({
			cadence: [ ...score.cadence ],
			start: autoPlay,
			zones: zones,
		});


		score.each((note, i) => {
			/**
			 * Optionally write the SpriteSheet's version of the Note (e.g. Texture) *back* into the Note.ref
			 * This is useful when you want to use the Note as the texture cache, instead of a lookup.
			 */
			if(writeback === true && typeof note.ref === "string") {
				note.ref = spritesheet.get(note.ref);
			}

			/**
			 * Add the note data to the notes array.
			 * [ index, duration, Texture ]
			 */
			// notes.push([ i, score.cadence[ i ], spritesheet.get(note.ref) ]);
			notes.push([ i, score.cadence[ i ], () => {
				let ref = note.ref;

				/**
				 * When Grid coordinates are passed, consult the Zone to determine the offset.
				 */
				if(typeof ref === "string" && ref.includes(",")) {
					let [ tx, ty ] = ref.split(",").map(v => parseInt(v));
					let { x, y } = composition.zones.current || {};

					tx += x || 0;
					ty += y || 0;

					ref = [ tx, ty ].join(",");
				}

				return spritesheet.get(ref);
			} ]);
		});

		composition.sprites = notes;

		return composition;
	}
};

export default Composition;