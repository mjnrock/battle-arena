import { useEffect } from "react";

import CreateGame from "../game/BattleArena";

import { PixiCanvas } from "../components/PixiCanvas";

import { Base64 } from "./../game/util/Base64";

//TODO: Move this somewhere -- it takes a pixel image and redraws it scaled by @factor (i.e. 1 pixel = @factor * pixels)
Base64.DecodeFile("assets/images/squirrel.png").then(canvas => {
	const factor = 10;
	const ctx = canvas.getContext("2d");
	const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = {};

	for(let i = 0; i < imgData.data.length; i += 4) {
		const r = imgData.data[ i ];
		const g = imgData.data[ i + 1 ];
		const b = imgData.data[ i + 2 ];
		const a = imgData.data[ i + 3 ];

		const index = i / 4;
		data[ index ] = {
			index,
			x: (index % canvas.width),
			y: Math.floor(index / canvas.width),
			r,
			g,
			b,
			a,
			avg: (r + g + b) / 3,
		};
	}

	canvas.width = canvas.width * factor;
	canvas.height = canvas.height * factor;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	function writeZone({ x, y, r, g, b, a }) {
		const color = `rgba(${ r }, ${ g }, ${ b }, ${ a })`;

		ctx.fillStyle = color;
		ctx.fillRect(x * factor, y * factor, factor, factor);
	}

	for(let pixel of Object.values(data)) {
		let { x, y, r, g, b, a } = pixel;

		writeZone(pixel);
	}

	console.log(canvas.toDataURL());
});

const game = CreateGame({
	// ...args,
});

export function GameRoute() {
	useEffect(() => {
		game.renderer.ticker.start();

		// console.log(game);
		// console.log(game.realm.worlds.overworld.nodes[ "0,0" ]);

		return () => {
			game.renderer.ticker.stop();
		};
	}, []);

	return (
		<PixiCanvas view={ game.renderer.canvas } />
	);
};

export default GameRoute;