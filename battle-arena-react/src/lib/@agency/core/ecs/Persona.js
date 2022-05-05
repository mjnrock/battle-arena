import { v4 as uuid } from "uuid";

import Module from "../../../entity/component/Module";

export class Persona {
	constructor(nomen, ...modulesOrPersonas) {
		this.id = uuid();
		this.nomen = nomen;
		this.concepts = new Map(modulesOrPersonas);

		return new Proxy(this, {
			get(target, prop) {
				if(target.concepts.has(prop)) {
					return target.concepts.get(prop);
				}

				return Reflect.get(target, prop);
			},
			set(target, prop, value) {
				if(value instanceof Module || value instanceof Persona) {
					return target.concepts.set(prop, value);
				}

				return Reflect.set(target, prop, value);
			},
			deleteProperty(target, prop) {
				if(target.concepts.has(prop)) {
					return target.concepts.delete(prop);
				}

				return Reflect.deleteProperty(target, prop);
			},
		});
	}

	setConcepts(...componentsOrPersons) {
		for(let concept of componentsOrPersons) {
			if(concept instanceof Module) {
				this.concepts.set(concept.nomen, concept);
			} else if(concept instanceof Persona) {
				this.concepts.set(concept.nomen, concept);
			}
		}

		return this;
	}
}