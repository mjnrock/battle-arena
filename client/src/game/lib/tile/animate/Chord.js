import { Note } from "./Note";

export class Chord extends Note {
	constructor({ ref, duration, isRelative = false } = {}) {
		super({ ref, duration, isRelative });

		//TODO Account for multiple Notes in the .ref property.
	}
};

export default Chord;