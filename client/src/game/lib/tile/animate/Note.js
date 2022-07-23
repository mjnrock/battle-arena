export class Note {
	constructor({ ref, duration, isRelative = false } = {}) {
		this.ref = ref;
		this.duration = duration;
		this.isRelative = isRelative;
	}

	setIsRelative() {
		this.isRelative = true;

		return this;
	}
	setIsAbsolute() {
		this.isRelative = false;

		return this;
	}
};

export default Note;