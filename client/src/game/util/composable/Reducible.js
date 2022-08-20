import { Identity } from "../../util/Identity";
import { MapSet } from "../MapSet";

/**
 * This is the main composition object for a Reducible.
 * Use this when you want to add reducible functionality
 * to an existing object.
 */
export const $Reducible = (self) => Object.assign(self, {
	/**
	 * A designated state-space for the object
	 */
	state: {},

	/**
	 * Functions that will reduce the state upon a dispatch
	 */
	reducers: new MapSet(),

	/**
	 * Side-effects that will be invoked upon a successful reduction
	 */
	effects: new MapSet(),

	/**
	 * The invoking function to activate the reducers and effects
	 * using this.state as the base.  This is intended to be
	 * used when this.state is the primary interest.
	 */
	dispatch(action, ...args) {
		const reducers = this.reducers.get(action);

		if(reducers) {
			for(let reducer of reducers) {
				this.state = reducer(this.state, ...args);
			}
			
			const effects = this.effects.get(action);
			if(effects) {
				effects.forEach(effect => {
					effect(this.state, ...args);
				});
			}
		}

		return this.state;
	},

	/**
	 * The invoking function to activate the reducers and effects
	 * using target.state as the base.  This is intended to be used
	 * in situations where the Reducible is acting in a proxy-like
	 * or system-like capacity.
	 */
	trigger(target, action, ...args) {
		const reducer = this.reducers.get(action);

		if(reducer) {
			target.state = reducer(target.state, ...args);
			
			const effects = this.effects.get(action);
			if(effects) {
				effects.forEach(effect => {
					effect(target.state, ...args);
				});
			}
		}
		return target.state;
	},
});

/**
 * Use the Reducible when you want to utilize state-reducer-effect functionality.
 * By default, a .dispatch will reduce the state, and a .trigger will reduce the target.state.
 * This allows the Reducible to act autonomously or as a facilitator.
 */
export class Reducible extends Identity {
	constructor ({ state = {}, reducers = [], effects = [], ...opts } = {}) {
		super({ ...opts });

		$Reducible(this);

		this.state = state;
		this.reducers.addObject(reducers);
		this.effects.addObject(effects);

		console.log(this)
	}
};

export default Reducible;