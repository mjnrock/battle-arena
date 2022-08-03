import Identity from "../Identity";

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

	constructor ({ element, ...rest } = {}) {
		super({ ...rest });

		this.mask = 0;
		this.modifiers = 0;

		this.element = null;
		this.bindElement(element);
	}

	/**
	 * Bind any event handler that has a defined handler in this class
	 */
	bindElement(element) {
		this.element = element;

		for (let key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
			if(key.substring(0, 2) === "on") {
				this.element[ key.toLowerCase() ] = e => this[ key ].call(this, e);
			}
		}

		return this;
	}
	unbindElement() {
		for (let key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
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

		console.log(e.type, e.code);

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
		e.preventDefault();
		this.updateMask(e, true);

		// this.addEvent({
		// 	type: "down",
		// 	x: e.clientX,
		// 	y: e.clientY,
		// });

		return this;
	}
	onKeyUp(e) {
		e.preventDefault();
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