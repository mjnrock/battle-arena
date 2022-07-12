import { useContext } from "react";

import { Context } from "./../App";

import { PixiCanvas } from "../components/PixiCanvas";

export function Default() {
	const { game } = useContext(Context);
	
	return (
		<PixiCanvas app={ game.render.app } />
	);
};

export default Default;