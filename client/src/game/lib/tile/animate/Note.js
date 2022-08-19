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

	static FromObject(obj = {}) {
		return new Note({
			ref: obj.ref,
			duration: obj.duration,
			isRelative: obj.isRelative,
		});
	}
};

export default Note;