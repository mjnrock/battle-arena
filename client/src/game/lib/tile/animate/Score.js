import { Timer } from "./Timer";
import { Measure } from "./Measure";

export class Score {
	constructor ({ measures = [] } = {}) {
		this.measures = Array.from(measures);

		this.duration = 0;
		this.cadence = this.refresh();
		this.timer = new Timer({
			cadence: this.cadence,
		});
	}

	addMeasure(measure) {
		this.measures.push(measure);

		return this;
	}
	addMeasureAt(measure, index) {
		this.measures.splice(index, 0, measure);

		return this;
	}
	removeMeasure(measure) {
		this.measures.splice(this.measures.indexOf(measure), 1);

		return this;
	}
	removeMeasureAt(index) {
		this.measures.splice(index, 1);

		return this;
	}
	swapMeasures(index1, index2) {
		const measure1 = this.measures[ index1 ];
		const measure2 = this.measures[ index2 ];

		this.measures[ index1 ] = measure2;
		this.measures[ index2 ] = measure1;

		return this;
	}
	clear() {
		this.measures = [];

		return this;
	}

	get current() {
		return this.timer.current;
	}

	refresh() {
		this.duration = 0;
		this.cadence = this.measures.reduce((acc, measure) => {
			/**
			 * Ensure that the Measure is up-to-date, before proceeding.
			 */
			measure.refresh();

			this.duration += measure.duration;

			return acc.concat(measure.cadence);
		}, []);

		return this.cadence;
	}

	each(fn) {
		const results = [];
		
		for(let i = 0; i < this.measures.length; i++) {
			const measureResults = this.measures[ i ].each(fn);

			results.push(...measureResults);
		}

		return results;
	}

	/**
	 * This will create Measures with equally-spaced cadence.
	 * TODO: Add a smart check to see if the note-level entries (df. ref) are strings, arrays, or objects.
	 */
	static FromArray(array, zones) {
		return new Score({
			measures: array.map(measure => Measure.FromArray(measure)),
			zones,
		});
	}
};

export default Score;