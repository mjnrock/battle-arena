import System from "../../lib/ecs/System";
import { Name as CompName } from "../components/MainLoop";

export class MainLoop extends System {
	constructor ({ onBegin, onTick, onRender, onEnd, handlers = {} } = {}) {
		super();

		this.handlers.addHandlers({
			start: this.start.bind(this),
			stop: this.stop.bind(this),

			...handlers,
		});

		this.onBegin = onBegin || this.onBegin;
		this.onTick = onTick || this.onTick;
		this.onRender = onRender || this.onRender;
		this.onEnd = onEnd || this.onEnd;
	}

	//#region Helpers
	get(entity) {
		if(entity.has(CompName)) {
			return entity.get(CompName);
		}

		return false;
	}

	fps(ml) {
		return 1000 / ml.getSimulationTimestep();
	}
	spf(ml) {
		return ml.getSimulationTimestep() / 1000;
	}
	//#endregion Helpers

	//#region Default MainLoop Handlers
	onBegin({ now }) {
		//* console.log("begin", now);
	}
	onTick({ dt, now }) {
		//* console.log("tick", now, dt);
	}
	onRender({ ip, now }) {
		//* console.log("render", now, ip);
	}
	onEnd({ fps, panic }) {
		//* console.log("end", fps, panic);
	}
	//#endregion Default MainLoop Handlers


	//#region Events
	start({ entities }) {
		for(let entity of entities) {
			const ml = this.get(entity);

			if(ml) {
				ml._mainloop.setBegin(() => {
					this.onBegin.call(entity, {
						now: Date.now(),
					});
				});

				ml._mainloop.setUpdate((ms) => {
					ml.lastUpdate = Date.now();

					this.onTick.call(entity, {
						dt: ms / 1000,
						now: Date.now(),
						lastUpdate: ml.lastUpdate,
					});
				});

				ml._mainloop.setDraw((ip) => {
					ml.lastDraw = Date.now();

					this.onRender.call(entity, {
						ip: this.spf(ml._mainloop) * ip,
						now: Date.now(),
						lastDraw: ml.lastDraw,
					});
				});

				ml._mainloop.setEnd((fps, panic) => {
					this.onEnd.call(entity, {
						fps,
						panic,
					});
				});

				ml._mainloop.start();
				ml.start = Date.now();
			}
		}
	}
	stop({ entities }) {
		for(let entity of entities) {
			const ml = this.get(entity);

			if(ml) {
				ml._mainloop.stop();
				ml.start = null;
			}
		}
	}
	//#endregion Events
};

export default MainLoop;