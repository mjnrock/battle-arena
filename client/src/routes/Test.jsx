import { Reducible, $Reducible } from "../game/util/composable/Reducible";
import { Eventable, $Eventable } from "../game/util/composable/Eventable";
import { Subscribable, $Subscribable } from "../game/util/composable/Subscribable";
import { Watchable, $Watchable } from "../game/util/composable/Watchable";
import { Observable, $Observable } from "../game/util/composable/Observable";
import { MapSet } from "./../game/util/MapSet";

// const ms = new MapSet({
// 	test: () => 1,
// 	bob: [
// 		1, 2, 3,
// 	],
// 	cat: new Set([ 7, 5 ]),
// });

// console.log(ms)

// for(let [ k, v ] of ms) {
// 	console.log(k, v)
// }

// const r = new Reducible({
// 	reducers: {
// 		test: [
// 			() => 1234,
// 			(a) => a + 564,
// 		]
// 	},
// 	effects: {
// 		test: () => console.log("82934792834723"),
// 	},
// });
// // r.cats = "meow"
// // const rc = $Reducible(r);

// console.log(r)
// // console.log(rc)

// // r.reducers.add("test", () => 1234);

// console.log(r.state)
// r.dispatch("test");
// console.log(r.state)

// const e = new Eventable({
// 	events: {
// 		test: [
// 			() => console.log("test"),
// 			() => console.log("test2"),
// 			() => console.log("test3"),
// 		],
// 	}
// });

// console.log(e)

// e.emit("test");

// const w = new Watchable({
// 	watchers: {
// 		cat: (...args) => console.log("MEOWWW", ...args),
// 	},
// });
// w.cat = 567;

// console.log(w)

// const o = new Observable({
// 	observers: [
// 		(...args) => console.log("MEOWWW", ...args),
// 	],
// });
// o.dog = 567;

// let a = o.dog;

// o.dog = 123;

// console.log(o)

// delete o.dog;

export function Test() {
	return (
		<div>
		</div>
	);
};

export default Test;