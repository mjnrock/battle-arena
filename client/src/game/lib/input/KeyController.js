import Identity from "../Identity";

//TODO: Allow configurable keys to not be intercepted (e.g. @bypass = [ "F5", "F12" ])
//TODO: Create an only/except list for event listening (e.g. @only = [ "KeyUp", "KeyDown" ], @except = [ "KeyPress" ])
//? Maybe create a list of events in the .config with a boolean flag whether it should fire those events or not and @only/@except T/F those entries

export class KeyController extends Identity {
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

	constructor ({ element, config = {}, ...rest } = {}) {
		super({ ...rest });

		this.mask = 0;
		this.modifiers = 0;

		this.config = {
			excludedKeys: KeyController.ExludedKeys,

			...config,
		};

		this.element = null;
		this.bindElement(element);
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
				this.element[ key.toLowerCase() ] = e => this[ key ].call(this, e);
			}
		}

		return this;
	}
	unbindElement() {
		for(let key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
			if(key.substring(0, 2) === "on") {
				this.element[ key.toLowerCase() ] = null;
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

		return this;
	}

	onKeyDown(e) {
		if(!this.config.excludedKeys.includes(e.code)) {
			e.preventDefault();
		}

		this.updateMask(e, true);

		// this.addEvent({
		// 	type: "down",
		// 	x: e.clientX,
		// 	y: e.clientY,
		// });

		return this;
	}
	onKeyUp(e) {
		if(!this.config.excludedKeys.includes(e.code)) {
			e.preventDefault();
		}

		this.updateMask(e, false);

		// this.addEvent({
		// 	type: "up",
		// 	x: e.clientX,
		// 	y: e.clientY,
		// });

		return this;
	}
};

export default KeyController;