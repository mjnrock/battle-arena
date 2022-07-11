export const Name = `ancestry`;

export function Ancestry({ parent, children = [] } = {}) {
	return {
		parent,
		children: new Set(children),
	};	
};

export const DefaultPair = [ Name, Ancestry ];

export default Ancestry;