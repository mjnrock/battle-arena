import { v4 as uuid } from "uuid";

export class Struct {
	constructor ({ id } = {}) {
		this.id = id || uuid();
	}
}

export default Struct;