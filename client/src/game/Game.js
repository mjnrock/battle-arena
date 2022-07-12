import { Identity } from "./lib/Identity";
import { Registry } from "./lib/Registry";

import { KeyController } from "./lib/input/KeyController";
import { MouseController } from "./lib/input/MouseController";

import { World } from "./data/entities/realm/World";
import { Pixi } from "./Pixi";

export class Game extends Identity {
	static Instance;

	static getInstance() {
		if(!Game.Instance) {
			throw new Error(`<< Game.Instance >> is not set.  Either create a new instance first or override this method.`);
			// Game.Instance = new Game();
		}

		return Game.Instance;
	}

	constructor ({ id, tags } = {}) {
		super({ id, tags });
		
		this.input = {
			// keyboard: new KeyController({ element: window }),
			// mouse: new MouseController({ element: window }),
			// keyboard: {},	// STUB
			// mouse: {},		// STUB
		};
		
		this.systems = new Registry();

		this.realm = new Registry({
			overworld: new World({
				size: [ 2, 2 ],
			}),
		});

		/**
		 * Invoke all the creation hooks
		 */
		this.pre()
			.init()
			.post();

		if(!Game.Instance) {
			Game.Instance = this;
		}
	}

	pre() {
		return this;
	}
	init() {
		return this;
	}
	post() {
		this.render = new Pixi();

		//NOTE: This works -- abstract this out to appropriate place
		// const graphics = new PixiJS.Graphics();
		// setInterval(() => {

		// 	// Rectangle
		// 	graphics.beginFill(0xDE3249);
		// 	graphics.drawRect(Math.random() * 500, Math.random() * 500, 100, 100);
		// 	graphics.endFill();
	
		// 	this.render.app.stage.addChild(graphics);
		// }, 1000);

		return this;
	}
};

export default Game;