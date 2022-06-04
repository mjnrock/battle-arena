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
		this.value = value;

		return this;
	}

	getValue(registry, entry) {
		if(entry.type === RegistryEntry.Type.VALUE) {
			return entry.value;
		} else if(entry.type === RegistryEntry.Type.ALIAS) {
			return registry.get(entry.value);
		} else if(entry.type === RegistryEntry.Type.FUNCTION) {
			return entry.value(registry);
		} else if(entry.type === RegistryEntry.Type.POOL) {
			return entry.value.map(id => registry.get(id));
		}
	}
}

export default RegistryEntry;