import Component from "./Component";

export class Environment extends Component {
	constructor ({ id, tags } = {}) {
		super({ id, tags });
	}
}

export default Environment;