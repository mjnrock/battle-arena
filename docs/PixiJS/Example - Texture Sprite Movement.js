import * as PixiJS from "pixi.js";

export class Pixi {
	constructor () {
		this.app = new PixiJS.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			antialias: true,
			resolution: window.devicePixelRatio || 1,
		});

		console.log(this.app)


		const graphics = new PixiJS.Graphics();

		// Rectangle
		graphics.beginFill(0xDE3249);
		graphics.drawRect(50, 50, 100, 100);
		graphics.endFill();

		this.app.stage.addChild(graphics);
	}

	//STUB - Quickly compiled here for future learning
	preloadAssets () {
		this.app.loader.baseUrl = "images";
		this.app.loader
			.add("player", "player.png")
			.add("enemy", "enemy.png");

		this.app.loader.onProgress.add((e) => {
			console.log("Loading assets...", e.progress);
		});
		this.app.loader.onComplete.add(() => {
			console.log("Done loading!");
		});
		this.app.loader.onError.add((e) => {
			console.error("Error", e.message);
		});
		
		this.app.loader.load(() => console.log("Complete!"));

		//* this.app.ticker.add(gameLoop);

		const playerSprite = PixiJS.Sprite.from(this.app.loader.resources[ "player" ].texture);
		playerSprite.x = this.app.view.width / 2;
		playerSprite.y = this.app.view.height / 2;
		playerSprite.anchor.set(0.5);

		this.app.stage.addChild(playerSprite);

		console.log(this.app.loader);
		console.log(this.app.stage);
	}

	//STUB - Quickly compiled here for future learning
	createPlayerSheet() {
		const playerSheet = new PixiJS.BaseTexture.from(this.app.loader.resources[ "player" ].url);
		let w = 64,
			h = 64;

		playerSheet[ "standSouth" ] = [
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(0, 0, w, h)),
		];
		playerSheet[ "standNorth" ] = [
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w, 0, w, h)),
		];
		playerSheet[ "standWest" ] = [
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w * 2, 0, w, h)),
		];
		playerSheet[ "standEast" ] = [
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w * 3, 0, w, h)),
		];

		playerSheet[ "walkSouth" ] = [
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(0, h, w, h)),
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w, h, w, h)),
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w * 2, h, w, h)),
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w * 3, h, w, h)),
		];
		playerSheet[ "walkNorth" ] = [
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(0, h * 2, w, h)),
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w, h * 2, w, h)),
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w * 2, h * 2, w, h)),
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w * 3, h * 2, w, h)),
		];
		playerSheet[ "walkWest" ] = [
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(0, h * 3, w, h)),
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w, h * 3, w, h)),
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w * 2, h * 3, w, h)),
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w * 3, h * 3, w, h)),
		];
		playerSheet[ "walkEast" ] = [
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(0, h * 4, w, h)),
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w, h * 4, w, h)),
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w * 2, h * 4, w, h)),
			new PixiJS.Texture(playerSheet, new PixiJS.Rectangle(w * 3, h * 4, w, h)),
		];

		return playerSheet;
	}

	//STUB - Quickly compiled here for future learning
	createPlayer() {
		const playerSheet = this.createPlayerSheet();
		const player = new PixiJS.Sprite(playerSheet[ "walkSouth" ]);
		player.loop = false;
		player.anchor.set(0.5);
		player.animationSpeed = 0.5;
		player.x = this.app.view.width / 2;
		player.y = this.app.view.height / 2;

		this.app.stage.addChild(player);

		player.play();

		return player;
	}

	//STUB - Quickly compiled here for future learning
	gameLoop(delta) {
		// console.log(delta);

		//? Player movement (SOUTH)
		if(!player.player) {
			player.textures = playerSheet[ "walkSouth" ];
			player.play();
		}
		player.y -= 5;

		//? Player movement (NORTH)
		if(!player.player) {
			player.textures = playerSheet[ "walkNorth" ];
			player.play();
		}
		player.y += 5;
	}
};

export default Pixi;