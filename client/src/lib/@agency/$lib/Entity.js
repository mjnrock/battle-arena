import Component from "./Component";

export class Entity extends Component {
	constructor ({ id, tags } = {}) {
		super({ id, tags });
	}
}

export default Entity;