export class Directive {
	constructor(message, interpretation) {
		this.message = message;
		this.interpretation = interpretation;
	}

	process(...args) {
		return this.interpretation(this.message, ...args);
	}
};

export default Directive;