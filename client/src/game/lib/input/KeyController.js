import GroupRunner from "../../util/relay/GroupRunner";
import { Identity } from "../Identity";
import { Events } from "./../../util/relay/Events";

//TODO: Allow configurable keys to not be intercepted (e.g. @bypass = [ "F5", "F12" ])
//TODO: Create an only/except list for event listening (e.g. @only = [ "KeyUp", "KeyDown" ], @except = [ "KeyPress" ])
//? Maybe create a list of events in the .config with a boolean flag whether it should fire those events or not and @only/@except T/F those entries

export class KeyController extends Identity {
	static EventTypes = {
		KEY_MASK: "keymask",
		KEY_MODIFIER: "keymodifier",
		KEY_DOWN: "keydown",
		KEY_UP: "keyup",
		KEY_PRESS: "keypress",
		KEY_CHORD: "keychord",
	};

	static MaskFlags = {
		UP: 2 << 0,
		DOWN: 2 << 1,
		LEFT: 2 << 2,
		RIGHT: 2 << 3,
	};

	static ModifierFlags = {
		SHIFT: 2 << 0,
		CTRL: 2 << 1,
		ALT: 2 << 2,
		META: 2 << 3,
	};

	static ExludedKeys = [
		"F5",
		"F11",
		"F12",
	];

	/**
	 * The KeyController effectively intercepts events from the @element and, based on
	 * de/activation settings in the config, performs work and updates the state of the
	 * KeyController, after which it emits its own version of the event (cf. EnumTypes)
	 * to any listeners that may be present (e.g. Game/..X).
	 */
	constructor ({ element, config = {}, ...rest } = {}) {
		super({ ...rest });

		this.state = {};

		this.mask = 0;
		this.modifiers = 0;
		this.handlers = new GroupRunner({
			onKeyDown: this,
			onKeyUp: this,
			onKeyPress: this,
		});
		this.events = new Events();

		/**
		 * Create an object where all events are enabled by default
		 */
		// let _events = Object.fromEntries(Object.values(KeyController.EventTypes).map(value => [ value, true ]));
		
		this.config = {
			excludedKeys: KeyController.ExludedKeys,
			events: {
				[ KeyController.EventTypes.KEY_UP ]: true,
				[ KeyController.EventTypes.KEY_DOWN ]: true,
				[ KeyController.EventTypes.KEY_PRESS ]: false,
				[ KeyController.EventTypes.KEY_MASK ]: false,
				[ KeyController.EventTypes.KEY_MODIFIER ]: false,
				[ KeyController.EventTypes.KEY_CHORD ]: false,
			},

			...config,
		};

		this.element = null;
		this.bindElement(element);
	}


	getState() {
		return this.state;
	}
	setState(state) {
		this.state = state;

		return this.state;
	}
	mergeState(state = {}) {
		this.state = {
			...this.state,
			...state,
		};

		return this.state;
	}


	/**
	 * Assert that a given event is enabled in the config
	 */
	assert(event) {
		return this.config.events[ event ] === true;
	}
	/**
	 * Dis/Enable the event listener for a given event type, optionally
	 * assigning the truthiness via @value instead of toggling it.
	 */
	toggle(event, value) {
		if(event in this.config.events) {
			if(value === void 0) {
				this.config.events[ event ] = !this.config.events[ event ];
			} else {
				this.config.events[ event ] = value;
			}
		}

		return this.config.events[ event ];
	}


	get hasUp() {
		return this.mask & KeyController.MaskFlags.UP;
	}
	get hasDown() {
		return this.mask & KeyController.MaskFlags.DOWN;
	}
	get hasLeft() {
		return this.mask & KeyController.MaskFlags.LEFT;
	}
	get hasRight() {
		return this.mask & KeyController.MaskFlags.RIGHT;
	}

	get hasShift() {
		return this.modifiers & KeyController.ModifierFlags.SHIFT;
	}
	get hasCtrl() {
		return this.modifiers & KeyController.ModifierFlags.CTRL;
	}
	get hasAlt() {
		return this.modifiers & KeyController.ModifierFlags.ALT;
	}
	get hasMeta() {
		return this.modifiers & KeyController.ModifierFlags.META;
	}


	/**
	 * Bind any event handler that has a defined handler in this class
	 */
	bindElement(element) {
		this.element = element;

		for(let key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
			if(key.substring(0, 2) === "on") {
				let type = key.toLowerCase(),
					handler = e => {
						/**
						 * Only fire the handler if the event is enabled in the config
						 */
						if(this.assert(type)) {
							this.handlers.run(key, e);
						}
					}

				/**
				 * If the element follows the EventEmitter interface, add an event listener,
				 * else assign the event listener
				 */
				if("addEventListener" in this.element) {
					type = type.substring(2);
					this.element.addEventListener(type, handler);
				} else {
					this.element[ type ] = handler;
				}
			}
		}

		return this;
	}
	unbindElement() {
		if("removeAllListeners" in this.element) {
			this.element.removeAllListeners();
		} else {
			for(let key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
				if(key.substring(0, 2) === "on") {
					const type = key.toLowerCase();

					this.element[ type ] = null;
				}
			}
		}

		this.element = null;

		return this;
	}


	updateMask(e, add = true) {
		const { code } = e;

		if(add) {
			if(code === "ArrowUp" || code === "KeyW") {
				this.mask |= KeyController.MaskFlags.UP;
			} else if(code === "ArrowDown" || code === "KeyS") {
				this.mask |= KeyController.MaskFlags.DOWN;
			} else if(code === "ArrowLeft" || code === "KeyA") {
				this.mask |= KeyController.MaskFlags.LEFT;
			} else if(code === "ArrowRight" || code === "KeyD") {
				this.mask |= KeyController.MaskFlags.RIGHT;
			}
		} else {
			if(code === "ArrowUp" || code === "KeyW") {
				this.mask &= ~KeyController.MaskFlags.UP;
			} else if(code === "ArrowDown" || code === "KeyS") {
				this.mask &= ~KeyController.MaskFlags.DOWN;
			} else if(code === "ArrowLeft" || code === "KeyA") {
				this.mask &= ~KeyController.MaskFlags.LEFT;
			} else if(code === "ArrowRight" || code === "KeyD") {
				this.mask &= ~KeyController.MaskFlags.RIGHT;
			}
		}

		this.emit(KeyController.EventTypes.KEY_MASK, this.mask);

		this.updateModifiers(e);

		console.log(e.type, e.code, this.mask);

		return this;
	}
	updateModifiers(e) {
		if(e.shiftKey) {
			this.modifiers |= KeyController.ModifierFlags.SHIFT;
		} else {
			this.modifiers &= ~KeyController.ModifierFlags.SHIFT;
		}

		if(e.ctrlKey) {
			this.modifiers |= KeyController.ModifierFlags.CTRL;
		} else {
			this.modifiers &= ~KeyController.ModifierFlags.CTRL;
		}

		if(e.altKey) {
			this.modifiers |= KeyController.ModifierFlags.ALT;
		} else {
			this.modifiers &= ~KeyController.ModifierFlags.ALT;
		}

		if(e.metaKey) {
			this.modifiers |= KeyController.ModifierFlags.META;
		} else {
			this.modifiers &= ~KeyController.ModifierFlags.META;
		}

		this.emit(KeyController.EventTypes.KEY_MODIFIER, this.modifiers);

		return this;
	}


	/**
	 * Pass the event to the handlers, alongside any additional @args
	 */
	emit(type, e, ...args) {
		if(this.assert(type)) {
			return this.events.emit(type, e, ...args);
		}
	}


	//#region Event Handlers
	onKeyDown(e) {
		if(!this.config.excludedKeys.includes(e.code)) {
			e.preventDefault();
		}

		this.updateMask(e, true);

		//TODO: Perform all the state-updating work here

		this.emit(KeyController.EventTypes.KEY_DOWN, e);

		return this;
	}
	onKeyUp(e) {
		if(!this.config.excludedKeys.includes(e.code)) {
			e.preventDefault();
		}

		this.updateMask(e, false);

		//TODO: Perform all the state-updating work here

		this.emit(KeyController.EventTypes.KEY_UP, e);

		return this;
	}
	onKeyPress(e) {
		if(!this.config.excludedKeys.includes(e.code)) {
			e.preventDefault();
		}

		this.updateMask(e, false);

		//TODO: Perform all the state-updating work here

		this.emit(KeyController.EventTypes.KEY_PRESS, e);

		return this;
	}
	//#endregion Event Handlers
};

export default KeyController;