import Agency from "@lespantsfancy/agency";
// export class Entity extends Agency.Observable {

import Observable from "./Observable";
export class Entity extends Observable {
    constructor() {
        super();
    }

    onTurn() {
        const GCD = 2500;       //STUB  Move to somewhere elsed
        if(Date.now() - this.task.timeoutStart < GCD) {
            return;
        }
        
        if(this.task.timeout === void 0) {
            const smudge = Agency.Util.Dice.random(0, GCD);
    
            this.task.timeout = setTimeout(this.onTurn.bind(this), GCD - smudge);
            this.task.timeoutStart = Date.now() - smudge;
        } else {
            clearTimeout(this.task.timeout);
    
            const random = () => Math.round(parseFloat((Agency.Util.Dice.random(-5, 5) / 5)));
            this.position.x += random();
            this.position.y += random();
    
            this.task.timeout = setTimeout(this.onTurn.bind(this), GCD);
            if(this.task.timeout) {
                this.task.timeoutStart = Date.now();
            }
        }
    }
    offTurn() {
        clearInterval(this.task.timeout);
        this.task.timeout = null;
        this.task.timeoutStart = null;
    }
}

export default Entity;