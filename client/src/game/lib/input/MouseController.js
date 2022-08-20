import { GroupRunner } from "../../util/relay/GroupRunner";
import { Identity } from "../../util/Identity";
import { Events } from "../../util/relay/Events";

//FIXME: Scroll does not work
//TODO: Build in an "offset" config property that offsets *all* X,Y coordinates -- primarily used for situations where the .element is not in the 0,0 window-position

export class MouseController extends Identity {
	static EventTypes = {
		MOUSE_MASK: "mousemask",
		MOUSE_MODIFIER: "mousemodifier",
		MOUSE_DOWN: "mousedown",
		MOUSE_UP: "mouseup",
		MOUSE_SCROLL: "mousescroll",
		MOUSE_MOVE: "mousemove",
		CONTEXT_MENU: "contextmenu",
	};

	static MaskFlags = {
		LEFT: 2 << 0,
		MIDDLE: 2 << 1,
		RIGHT: 2 << 3,
	};

	static ModifierFlags = {
		SHIFT: 2 << 0,
		CTRL: 2 << 1,
		ALT: 2 << 2,
		META: 2 << 3,
	};

	constructor ({ element, config = {}, ...rest } = {}) {
		super({ ...rest });

		this.state = {};

		this.mask = 0;
		this.modifiers = 0;
		this.handlers = new GroupRunner({
			onMouseDown: this,
			onMouseUp: this,
			onScroll: this,
			onMouseMove: this,
			onContextMenu: this,
		});
		this.events = new Events();

		/**
		 * Create an object where all events are enabled by default
		 */
		// let _events = Object.fromEntries(Object.values(KeyController.EventTypes).map(value => [ value, true ]));

		this.config = {
			excludedKeys: MouseController.ExludedKeys,
			events: {
				[ MouseController.EventTypes.MOUSE_UP ]: true,
				[ MouseController.EventTypes.MOUSE_DOWN ]: true,
				[ MouseController.EventTypes.MOUSE_SCROLL ]: true,
				[ MouseController.EventTypes.MOUSE_MOVE ]: true,
				[ MouseController.EventTypes.MOUSE_MASK ]: false,
				[ MouseController.EventTypes.MOUSE_MODIFIER ]: false,
				[ MouseController.EventTypes.CONTEXT_MENU ]: true,
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


	get hasLeft() {
		return this.mask & MouseController.MaskFlags.LEFT;
	}
	get hasMiddle() {
		return this.mask & MouseController.MaskFlags.MIDDLE;
	}
	get hasRight() {
		return this.mask & MouseController.MaskFlags.RIGHT;
	}

	get hasShift() {
		return this.modifiers & MouseController.ModifierFlags.SHIFT;
	}
	get hasCtrl() {
		return this.modifiers & MouseController.ModifierFlags.CTRL;
	}
	get hasAlt() {
		return this.modifiers & MouseController.ModifierFlags.ALT;
	}
	get hasMeta() {
		return this.modifiers & MouseController.ModifierFlags.META;
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
		const { button } = e;

		if(add) {
			if(button === 0) {
				this.mask |= MouseController.MaskFlags.LEFT;
			} else if(button === 1) {
				this.mask |= MouseController.MaskFlags.MIDDLE;
			} else if(button === 2) {
				this.mask |= MouseController.MaskFlags.RIGHT;
			}
		} else {
			if(button === 0) {
				this.mask &= ~MouseController.MaskFlags.LEFT;
			} else if(button === 1) {
				this.mask &= ~MouseController.MaskFlags.MIDDLE;
			} else if(button === 2) {
				this.mask &= ~MouseController.MaskFlags.RIGHT;
			}
		}

		this.updateModifiers(e);

		return this;
	}
	updateModifiers(e) {
		if(e.shiftKey) {
			this.modifiers |= MouseController.ModifierFlags.SHIFT;
		} else {
			this.modifiers &= ~MouseController.ModifierFlags.SHIFT;
		}

		if(e.ctrlKey) {
			this.modifiers |= MouseController.ModifierFlags.CTRL;
		} else {
			this.modifiers &= ~MouseController.ModifierFlags.CTRL;
		}

		if(e.altKey) {
			this.modifiers |= MouseController.ModifierFlags.ALT;
		} else {
			this.modifiers &= ~MouseController.ModifierFlags.ALT;
		}

		if(e.metaKey) {
			this.modifiers |= MouseController.ModifierFlags.META;
		} else {
			this.modifiers &= ~MouseController.ModifierFlags.META;
		}

		this.emit(MouseController.EventTypes.MOUSE_MODIFIER, this.modifiers);

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
	onMouseDown(e) {
		e.preventDefault();

		this.updateMask(e, true);

		this.emit(MouseController.EventTypes.MOUSE_DOWN, e, this);

		return this;
	}
	onMouseUp(e) {
		e.preventDefault();

		this.updateMask(e, false);

		this.emit(MouseController.EventTypes.MOUSE_UP, e, this);

		return this;
	}
	onScroll(e) {
		console.log(e);
		e.preventDefault();

		this.updateMask(e, false);


		this.emit(MouseController.EventTypes.MOUSE_SCROLL, e, this);

		return this;
	}
	onMouseMove(e) {
		e.preventDefault();

		this.state.pointer = {};
		this.state.pointer.x = e.clientX;
		this.state.pointer.y = e.clientY;
		this.state.pointer.lastUpdate = Date.now();

		this.emit(MouseController.EventTypes.MOUSE_MOVE, e, this);

		return this;
	}
	onContextMenu(e) {
		e.preventDefault();

		this.emit(MouseController.EventTypes.CONTEXT_MENU, e, this);

		return this;
	}
	//#endregion Event Handlers
};

export default MouseController;