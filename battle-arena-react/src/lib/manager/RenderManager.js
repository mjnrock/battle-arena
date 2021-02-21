/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import Game from "./../Game";

export default class RenderManager extends Agency.Context {
    constructor(game) {
        super({
            game,
        });

        this.addGame(game);
    }

    addGame(game) {
        if(game instanceof Game) {
            this.game = game;
            
            this.game.canvas.onDraw = (cvs) => {
                cvs.drawGrid();
    
                this.game.entities.values.forEach(entity => {
                    const { x, y } = entity.components.position;
                    const condition = entity.components.condition.current;
    
                    cvs.save();
                    if(condition === "IDLE") {
                        cvs.prop({ fillStyle: "rgba(0, 0, 255, 0.5)" });
                    } else if(condition === "RUNNING") {
                        cvs.prop({ fillStyle: "rgba(255, 0, 255, 0.5)" });
                    } else if(condition === "ATTACKING") {
                        cvs.prop({ fillStyle: `rgba(${ Agency.Util.Dice.random(0, 255) }, ${ Agency.Util.Dice.roll(0, 255) }, ${ Agency.Util.Dice.roll(0, 255) }, 0.5)` });
                    }
                    cvs.gRect(x, y, 1, 1, { isFilled: true });
                    cvs.restore();
                });
            };
        }
    }
}