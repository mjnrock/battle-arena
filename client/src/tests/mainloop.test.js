import Console from "../game/util/Console";
import Entity from "./../game/lib/ecs/Entity";
import Position from "./../game/data/components/Position";
import MainLoop from "./../game/data/components/MainLoop";
import SystemMainLoop from "./../game/data/systems/MainLoop";

Console.NewContext();

const ent = new Entity({
	components: {
		position: Position(),
		mainloop: MainLoop(),
	}
});
const sys = new SystemMainLoop({
	onTick: ({ dt, now }) => {
		Console.log(`tick ${ now } ${ dt }`);
	},
	onRender: ({ ip, now }) => {
		Console.log(`render ${ now } ${ ip }`);
	},
});

sys.invoke([ ent ], "start");
setTimeout(() => {
	sys.invoke([ ent ], "stop");
}, 500)