export class Measure {
	constructor({ notes = [], step = 250, duration = 1000 } = {}) {
		this.notes = Array.from(notes);
		this.step = step;
		this.duration = duration;
	}

	getNote(index) {
		return this.notes[ index ];
	}

	/**
	 * Beats per measure.
	 */
	get bpm() {
		return this.step / this.duration;
	}
};

export default Measure;