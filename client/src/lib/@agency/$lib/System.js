import Component from "./Component";

export class System extends Component {
	constructor ({ id, tags } = {}) {
		super({ id, tags });
	}
}

export default System;