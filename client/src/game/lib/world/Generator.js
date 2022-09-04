import FastNoiseLite from "fastnoise-lite";

export const Noise = {
	generate(width = 256, height = 256, { seed, noiseType, frequency = 0.01, ...rest } = {}) {
		const data = [];
		const canvas = document.createElement("canvas");
		const noise = new FastNoiseLite();
		noise.SetNoiseType(noiseType || FastNoiseLite.NoiseType.Perlin);
		noise.SetSeed(seed || ~~(Math.random() * 1000));
		noise.SetFrequency(frequency);

		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext("2d");
		for(let y = 0; y < canvas.height; y++) {
			for(let x = 0; x < canvas.width; x++) {
				if(typeof data[ x ] == "undefined") {
					data[ x ] = [];
				}

				data[ x ][ y ] = noise.GetNoise(x, y);

				ctx.fillStyle = `hsl(0, 0%, ${ Math.round(data[ x ][ y ] * 100) }%)`;
				ctx.fillRect(x, y, 1, 1);
			}
		}

		return { data, canvas };
	}
};