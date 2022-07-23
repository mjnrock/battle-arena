import { Timer } from "./Timer";

export class Score {
	constructor ({ measures = [] } = {}) {
		this.measures = Array.from(measures);

		this.duration = 0;
		this.cadence = this.refresh();
		this.timer = new Timer({
			cadence: this.cadence,
		});

		//* Delta example
		// this.timer = new Timer({
		// 	type: "delta",
		// 	cadence: this.cadence,
		// });
		// setInterval(() => {
		// 	this.timer.next(Date.now());
		// }, 500);
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
			this.duration += measure.duration;

			return acc.concat(measure.cadence);
		}, []);

		return this.cadence;
	}
};

export default Score;