export class Score {
	constructor({ measures = [] } = {}) {
		this.measures = measures;
		this.timer = new Timer();
	}

	get current() {
		return null;
	}
};

export default Score;