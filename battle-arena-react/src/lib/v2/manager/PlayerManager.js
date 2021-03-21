import Agency from "@lespantsfancy/agency";

import Registry from "./../util/Registry";
import Watcher from "./../util/Watcher";

// export class PlayerManager extends Watcher {
//     constructor(players = []) {
//         super([], {}, { deep: false });

//         this.players = new Registry();

//         this.add(...players);
//     }

//     add(...players) {
//         for(let i = 0; i < players.length; i++) {
//             const player = players[ i ];
            
//             if(!this.players.size && i === 0) {
//                 this.players.register(player, "player");
//             } else {
//                 this.players.register(player);
//             }

//             player.$.subscribe(this);
//         }
//     }
// }
export class PlayerManager extends Registry {
    constructor(players = []) {
        super({}, { deep: true });

        for(let i = 0; i < players.length; i++) {
            const player = players[ i ];
            
            this.register(player);

            // player.$.subscribe(this);
        }
    }
}

export default PlayerManager;