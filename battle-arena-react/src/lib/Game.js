import Agency from "@lespantsfancy/agency";
import GameLoop from "./GameLoop";

import Lib from "./package";

export default class Game extends Agency.Context {
    constructor({ fps = 5 } = {}) {
        super({
            loop: new GameLoop(fps),
            canvas: new Lib.GridCanvas(25, 25, { width: 500, height: 500, props: { fillStyle: "rgba(0, 0, 255, 0.5)", strokeStyle: "#000" } })
        });

        console.log(this.canvas)
        this.canvas.onDraw = (cvs) => {
            cvs.drawGrid();

            cvs.gRect(Agency.Util.Dice.d25(), Agency.Util.Dice.d25(), 1, 1, { isFilled: true });
        };

        // Create Singleton pattern
        if(!Game.Instance) {
            Game.Instance = this;
        }
    }

    // Access Singleton pattern via Game.$
    static get $() {
        if(!Game.Instance) {
            Game.Instance = new Game();
            
            // Game.$.loop.start();
        }

        return Game.Instance;
    }
}