import Registry from "../Registry";
import Factory from "../Factory";
import Component from "./Component";

export class Entity extends Registry {
	constructor (components = [], { id, tags } = {}) {
		super([], { id, tags });

		this.addClassifier(Registry.Classifiers.InstanceOf(Component, Registry, Entity));

		this.register(components);
	}

	[ Symbol.iterator ]() {
		const data = Array.from(this.__entries.values()).reduce((a, e) => {
			if(e.isValueType) {
				return [ ...a, [ e.value.name, e.value ] ];
			}

			return a;
		}, []);

		return data[ Symbol.iterator ]();
	}

	addComponent(name, state = {}, opts = {}) {
		const comp = name instanceof Component ? name : new Component(name, state, opts);

		this.register(comp);

		return comp;
	}
	removeComponent(name) {
		const comp = this.get(name instanceof Component ? name.name : name);

		if(comp) {
			this.unregister(comp);

			return true;
		}

		return false;
	}

	register(components = {}) {
		if(components instanceof Component) {
			const uuid = this.add(components);
			this.addAlias(uuid, components.name);
		} else if(Array.isArray(components)) {
			for(let key in components) {
				let comp = components[ key ];

				if(comp instanceof Factory) {
					comp = comp.create();

					if(!(comp instanceof Component)) {
						throw new Error("Factory .species must be a Component.");
					}
				}

				const uuid = this.add(comp);
				this.addAlias(uuid, comp.name);
			}
		} else if(typeof components === "object") {
			for(let key in components) {
				let comp = components[ key ];

				if(comp instanceof Factory) {
					comp = comp.create();

					if(!(comp instanceof Component)) {
						throw new Error("Factory .species must be a Component.");
					}
				} else if(comp instanceof Component) {
					//TODO Allow for variables to be passed through to the Component
					comp = comp.next();
				}

				const uuid = this.add(comp);
				this.addAlias(uuid, key);
				this.addAlias(uuid, comp.name);
			}
		}

		return this;
	}
};

export default Entity;