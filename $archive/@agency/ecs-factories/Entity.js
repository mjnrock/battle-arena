import Registry from "./Registry";

export class Entity extends Registry {
	constructor (components = {}, { ...opts } = {}) {
		super({}, { ...opts });

		//FIXME: This is not specific to Entity yet, and doesn't yet check if @component is structured correctly
		this.register(components);
	}
}

export default Entity;