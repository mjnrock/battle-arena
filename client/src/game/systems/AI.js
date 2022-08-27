import Helper from "../util/helper";
import { Dice } from "../util/Dice";
import { System } from "../lib/ecs/System";
import { Path } from "../lib/pathing/Path";

export class AI extends System {
	static Alias = "ai";

	constructor ({ ...opts } = {}) {
		super(opts);
	}

	wayfind(entities = [], { world }) {
		System.Each(entities, (entity) => {
			//NOTE: This code changes the Entity's velocity based on its AI Wayfinding component which dictates its current heading
			const { x, y } = entity.world;

			let Vx = entity.world.vx,
				Vy = entity.world.vy;

			if(entity.ai.wayfinder.hasPath) {
				entity.ai.wayfinder.current.test(x, y);

				let [ nx, ny ] = entity.ai.wayfinder.current.current;

				if(nx === void 0 || ny === void 0) {
					[ nx, ny ] = [ x, y ];
				}

				Vx = Helper.round(-(x - nx), 10);
				Vy = Helper.round(-(y - ny), 10);

				//FIXME Squirrels hump the ground during some point in the AI wayfinding process -- most likely culprit is at integer transition points (e.g. 1.9 <-> 2.0) [0.1 step is 1 / Helper.round(..., 10) ]

				let factor = 1;
				if(Vx < 0) {
					Vx = -factor * entity.world.speed;
				} else if(Vx > 0) {
					Vx = factor * entity.world.speed;
				}

				if(Vy < 0) {
					Vy = -factor * entity.world.speed;
				} else if(Vy > 0) {
					Vy = factor * entity.world.speed;
				}
			} else {
				entity.ai.wayfinder.drop([ x, y ]);

				// const [ tx, ty ] = [
				// 	Dice.random(0, world.width - 1),
				// 	Dice.random(0, world.height - 1),
				// ];
				// const path = Path.FindPath(world, [ entity.world.x, entity.world.y ], [ tx, ty ]);

				// if(path instanceof Path) {
				// 	entity.ai.wayfinder.set(path);
				// }
			}

			entity.world.vx = Vx || 0;
			entity.world.vy = Vy || 0;
		});

		return entities;
	}
};

export default AI;