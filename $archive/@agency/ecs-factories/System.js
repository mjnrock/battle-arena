import Component from "./Component";
import Entity from "./Entity";
import Events from "./Events";

export class System extends Component {
	constructor ({ events = {}, ...rest } = {}) {
		super({ ...rest });

		/**
		 *!FIXME: The .next / .delta paradigm changes when a Component has nested components.
		 */
		this.events = new Events({
			handlers: events,
		});
	}
}

export default System;