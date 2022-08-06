import Matter from "matter-js";

export const Name = `physics`;

export function Physics(state = {}) {
	return {
		name: Name,

		engine: Matter.Engine.create(),
		runner: Matter.Runner.create(),

		...state,
	};
};

export const DefaultPair = [ Name, MainLoop ];

export default MainLoop;