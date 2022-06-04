export class RegistryEntry {
	static Type = {
		VALUE: Symbol("VALUE"),
		ALIAS: Symbol("ALIAS"),
		FUNCTION: Symbol("FUNCTION"),
		POOL: Symbol("POOL"),
	};

	constructor (id, value, type = RegistryEntry.Type.VALUE) {
		this.id = id;
		this.type = type;

		if(type === RegistryEntry.Type.POOL) {
			this.value = new Set(value || []);
		} else {
			this.value = value;
		}

		return this;
	}

	getValue(registry) {
		if(this.type === RegistryEntry.Type.VALUE) {
			return this.value;
		} else if(this.type === RegistryEntry.Type.ALIAS) {
			return registry.get(this.value);
		} else if(this.type === RegistryEntry.Type.FUNCTION) {
			return this.value(registry);
		} else if(this.type === RegistryEntry.Type.POOL) {
			return Array.from(this.value).map(id => registry.get(id));
		}
	}
}

export default RegistryEntry;