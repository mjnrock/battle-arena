import Squirrel from "./Squirrel";

export const Entities = {
	//* [ Alias ]: Class | [ Class, ComponentEntryObject, ...rest ],

	Squirrel: [
		Squirrel,
		{
			Position: {
				x: -1.3,
				y: 0.5,
			},
		},
	],
};

export default Entities;