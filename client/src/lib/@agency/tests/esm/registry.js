import Console from "../../util/Console";

import Registry from "../../$next/Registry";

Console.NewContext();

const registry = new Registry();

// console.log(registry.__entries);

let kid = registry.add("kiszka");
let bid = registry.add("buddha");
registry.addAlias(kid, "meows", "poofs");
registry.addAlias(bid, "rawrs");

registry.setPool("cats", kid);
registry.addToPool("cats", bid);

// console.log(registry.__entries);
console.log(registry[ kid ]);
console.log(registry[ bid ]);
console.log(registry.meows);
console.log(registry.poofs);
console.log(registry.rawrs);
console.log(registry.cats);