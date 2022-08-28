import Note from "./Note";

/**
 * The Measure class is a musical abstraction for Sprite framing.  The @step property
 * represents a "unit" of time, and should be evenly divisible by into the @period property.
 * By default, the Measure @step=250/@period=1000 == 1/4, resolving to a "4-Note-per-second Measure".
 * While 1000ms is a natural denominator, it can be easily adjusted to fit whatever time
 * signature you want.
 * 
 * NOTE: @step/@period is only relevant for *relative* Notes.  When Note.isRelative=false, the
 * Note's .duration is used, allowing ms-level precision, when needed.
 */
export class Measure {
	constructor ({ notes = [], step = 250, period = 1000 } = {}) {
		this.notes = Array.from(notes);
		this.step = step;
		this.period = period;

		this.cadence = [];
		this.duration = this.refresh();
	}

	getNote(index) {
		return this.notes[ index ];
	}
	addNote(note) {
		this.notes.push(note);

		this.refresh();

		return this;
	}
	addNoteAt(note, index) {
		this.notes.splice(index, 0, note);

		this.refresh();

		return this;
	}
	removeNote(note) {
		this.notes.splice(this.notes.indexOf(note), 1);

		this.refresh();

		return this;
	}
	removeNoteAt(index) {
		this.notes.splice(index, 1);

		this.refresh();

		return this;
	}
	swapNotes(index1, index2) {
		const note1 = this.notes[ index1 ];
		const note2 = this.notes[ index2 ];

		this.notes[ index1 ] = note2;
		this.notes[ index2 ] = note1;

		this.refresh();

		return this;
	}
	clear() {
		this.notes = [];

		this.refresh();

		return this;
	}

	/**
	 * Recalculate and update the .cadence and .duration properties.
	 * 
	 * NOTE: This is run automatically when using relevant internal methods.
	 */
	refresh() {
		this.cadence = [];
		this.duration = this.notes.reduce((acc, note) => {
			let delta = note.duration;
			if(note.isRelative) {
				delta = note.duration * this.step;
			}

			acc += delta;

			this.cadence.push(delta);

			return acc;
		}, 0);

		return this.duration;
	}

	each(fn) {
		const results = [];

		for(let i = 0; i < this.notes.length; i++) {
			results.push(fn(this.notes[ i ], i));
		}

		return results;
	}

	/**
	 * Beats per measure.
	 */
	get bpm() {
		return this.period / this.step;
	}

	static CreateEquallyTimed(...noteRefs) {
		const notes = [];
		for(let ref of noteRefs) {
			const note = new Note({
				ref,
				duration: 1,
				isRelative: true,
			});

			notes.push(note);
		}

		const duration = 1000;
		return new Measure({
			notes,
			step: (1 / noteRefs.length) * duration,
			duration,
		});
	}

	/**
	 * This will pass the refs to the .CreateEqual() method.
	 */
	static FromArray(array) {
		return this.CreateEquallyTimed(...array);
	}
};

export default Measure;