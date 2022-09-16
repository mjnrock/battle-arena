import { Noise } from "./../game/lib/world/Generator";
import { Canvas } from "./../components/Canvas";

export function Test() {
	const { data, canvas } = Noise.generate(512, 512, {
		frequency: 0.01,
	});

	return (
		<div>
			<Canvas canvas={ canvas } />
		</div>
	);
};

export default Test;