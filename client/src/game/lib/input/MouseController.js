import Identity from "../Identity";

export class MouseEventEntry {
	constructor ({ type, x, y, button, modifiers, config, ...opts } = {}) {
		this.type = type;
		this.x = x;
		this.y = y;

		this.button = button;
		this.modifiers = modifiers;
		this.config = {
			distanceThreshold: 50,

			...config,
		};

		this.opts = opts;
		this.timestamp = Date.now();
	}

	distance(x, y) {
		return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
	}
	hasDistanceOf(x, y, threshold = this.config.distanceThreshold, { lt = false, lte = false, gt = false, gte = true } = {}) {
		const distance = this.distance(x, y);

		if(gte) {
			return distance >= threshold;
		} else if(gt) {
			return distance > threshold;
		} else if(lt) {
			return distance < threshold;
		} else if(lte) {
			return distance <= threshold;
		}

		return distance === threshold;
	}
};

export class MousePositionEntry {
	constructor ({ x, y, ...opts } = {}) {
		this.x = x;
		this.y = y;

		this.opts = opts;
		this.timestamp = Date.now();
	}
};

export class MouseController extends Identity {
	static MaskFlags = {
		LEFT: 2 << 0,
		MIDDLE: 2 << 1,
		RIGHT: 2 << 2,

		// WHEEL: 2 << 3,
		// MOVE: 2 << 4,
		// DOWN: 2 << 5,
		// UP: 2 << 6,
		// ENTER: 2 << 7,
		// LEAVE: 2 << 8,
		// OVER: 2 << 9,
		// OUT: 2 << 10,
		// HOVER: 2 << 11,
		// DRAG: 2 << 12,
		// DRAG_START: 2 << 13,
		// DRAG_END: 2 << 14,
		// DRAG_OVER: 2 << 15,
		// DRAG_OUT: 2 << 16,
		// DRAG_ENTER: 2 << 17,
		// DRAG_LEAVE: 2 << 18,
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

		this.events = new Map();
		this.path = new Set();

		this.element = null;
		this.bindElement(element);
	}

	addPath({ x, y } = {}) {
		this.path.add(new MousePositionEntry({ x, y }));

		return this;
	}
	clearPath() {
		this.path.clear();

		return this;
	}

	addEvent({ type, x, y, button, modifiers, config, ...opts } = {}) {
		this.events.set(type, new MouseEventEntry({ type, x, y, button, modifiers, config, ...opts }));

		return this;
	}
	clearEvents() {
		this.events.clear();

		return this;
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

		return this;
	}

	onMouseDown(e) {
		e.preventDefault();
		this.updateMask(e, true);

		// this.addEvent({
		// 	type: "down",
		// 	x: e.clientX,
		// 	y: e.clientY,
		// });

		return this;
	}
	onMouseUp(e) {
		e.preventDefault();
		this.updateMask(e, false);

		// this.addEvent({
		// 	type: "up",
		// 	x: e.clientX,
		// 	y: e.clientY,
		// });

		return this;
	}
	onMouseMove(e) {
		e.preventDefault();

		// this.addEvent({
		// 	type: "move",
		// 	x: e.clientX,
		// 	y: e.clientY,
		// });

		return this;
	}
	onContextMenu(e) {
		e.preventDefault();

		// this.addEvent({
		// 	type: "contextmenu",
		// 	x: e.clientX,
		// 	y: e.clientY,
		// });

		return this;
	}
};

export default MouseController;