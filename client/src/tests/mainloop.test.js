import Console from "../game/util/Console";
import Entity from "./../game/lib/ecs/Entity";
import MainLoop from "./../game/data/components/MainLoop";
import SystemMainLoop from "./../game/data/systems/MainLoop";

Console.NewContext();

const ent = new Entity({
	components: {
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

sys.handlers.addHandler("*", () => console.log("PRE"))
sys.handlers.addHandler("**", () => console.log("POST"))

sys.invoke([ ent ], "start");

setTimeout(() => {
	const result = sys.invoke([ ent ], "stop");
	
	console.log(result);
}, 500)