import Note from "./Note";

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

		return this;
	}
	addNoteAt(note, index) {
		this.notes.splice(index, 0, note);

		return this;
	}
	removeNote(note) {
		this.notes.splice(this.notes.indexOf(note), 1);

		return this;
	}
	removeNoteAt(index) {
		this.notes.splice(index, 1);

		return this;
	}
	swapNotes(index1, index2) {
		const note1 = this.notes[ index1 ];
		const note2 = this.notes[ index2 ];

		this.notes[ index1 ] = note2;
		this.notes[ index2 ] = note1;

		return this;
	}
	clear() {
		this.notes = [];

		return this;
	}

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

	static CreateEqual(...noteRefs) {
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
		return this.CreateEqual(...array);
	}
};

export default Measure;