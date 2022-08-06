import { Registry } from "../game/lib/Registry";

export function Test() {
	const registry = new Registry({
		test: [ 1, 2, 3 ],
	});

	console.log(registry);

	return (
		<div>
		</div>
	);
};

export default Test;