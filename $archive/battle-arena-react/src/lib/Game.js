import { v4 as uuid } from "uuid";
import Agent from "./@agency/core/Agent";

import GameLoop from "./GameLoop";
// import PlayerManager from "./manager/PlayerManager";

export default class Game extends Agent {
    constructor({ fps = 24 } = {}, agentObj = {}) {
		super({
			...agentObj,
			
			state: {
				id: uuid(),
				loop: new GameLoop(fps),
				config: {
					time: {
						GCD: 500,
						interaction: 250,
					},
					render: {
						tile: {
							width: 32,
							height: 32,
						},
					},
					SHOW_UI: true,
					SHOW_DEBUG: false,
					SHOW_HEATMAP: false,
					SHOW_WEAR: true,
					MOUSE_POSITION: [ 10, 10 ],
				},
			},
		});

		this.id = uuid();
        this.loop = new GameLoop(fps);
        // this.players = new PlayerManager();
		
		// this.loop.start();
		// this.loop.onpre = (...args) => console.log(this.loop.state, ...args)
		// this.loop.ontick = (...args) => console.log(this.loop.state, ...args)
		// this.loop.onpost = (...args) => console.log(this.loop.state, ...args)
		// this.loop.ondraw = (...args) => console.log(this.loop.state, ...args)

        this.meta = {
            time: {
                GCD: 500,
                interaction: 250,
            },
            render: {
                tile: {
                    width: 32,
                    height: 32,
                },
            },
            SHOW_UI: true,
            SHOW_DEBUG: false,
            SHOW_HEATMAP: false,
            SHOW_WEAR: true,
            MOUSE_POSITION: [ 10, 10 ],
        };

        //FIXME Probably should make this more robust
        // window.onfocus = e => this.loop.start();
        // window.onblur = e => this.loop.stop();
    }

    get current() {
        return this._current;
    }
    set current(node) {
        if(this.loop.mainLoop.isRunning()) {
            this.loop.stop();
            
            node.attach(this);
    
            this.loop.start();
        } else {
            node.attach(this);
        }

        this._current = node;
    }
}