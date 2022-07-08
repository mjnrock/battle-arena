import mainloop from "mainloop.js";

export const Name = `mainloop`;

export function MainLoop(state = {}) {
	return {
		name: Name,

		_mainloop: mainloop,

		start: null,
		lastUpdate: null,
		lastDraw: null,

		...state,
	};
};

export const DefaultPair = [ Name, MainLoop ];

export default MainLoop;