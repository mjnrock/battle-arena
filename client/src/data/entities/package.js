import Squirrel from "./Squirrel";

export const Entities = {
	//* [ Alias ]: Class | [ Class, ComponentEntryObject, ...rest ],

	Squirrel: [
		Squirrel,
		//TODO Allow for the object version below
		// {
		// 	Registrar: [],
		// 	Position: {
		// 		x: -1.3,
		// 		y: 0.5,
		// 	},
		// },
		[
			[ "Position", {
				x: 0,
				y: 1,
			} ],
			"Registrar",
		]
	],
};

export default Entities;