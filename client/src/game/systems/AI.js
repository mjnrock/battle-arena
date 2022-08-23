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

				//NOTE  Tween manipulation would go here (e.g. a bounce effect), instead of unitizing
				//FIXME @entity.world.speed >= 3 overshoots the tile, causing jitters.  Overcompensated movement must be discretized and applied sequentially to each progressive step in the Path.
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
				entity.ai.wayfinder.drop(entity.world);

				const [ tx, ty ] = [
					Dice.random(0, world.width - 1),
					Dice.random(0, world.height - 1),
				];
				const path = Path.FindPath(world, [ entity.world.x, entity.world.y ], [ tx, ty ]);

				if(path instanceof Path) {
					entity.ai.wayfinder.set(path);
				}
			}

			entity.world.vx = Vx;
			entity.world.vy = Vy;
		});

		return entities;
	}
};

export default AI;