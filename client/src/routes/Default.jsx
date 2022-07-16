import { useContext } from "react";

import { Context } from "./../App";

import { PixiCanvas } from "../components/PixiCanvas";


import testPixiMatter from "../PixiMatterTest";

export function Default() {
	const { game } = useContext(Context);
	
	return (
		// <PixiCanvas app={ game.render.app } />
		<PixiCanvas app={ testPixiMatter.renderer } />
	);
};

export default Default;