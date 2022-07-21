export class Note {
	constructor({ ref, duration, isRelative = false } = {}) {
		this.ref = ref;
		this.duration = duration;
		this.isRelative = isRelative;
	}
};

export default Note;