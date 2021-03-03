import Agency from "@lespantsfancy/agency";
import timeout from "p-timeout";
// export class Entity extends Agency.Observable {

import Observable from "./Observable";
export class Entity extends Observable {
    constructor() {
        super();
    }

    onTurn() {
        // const GCD = 2500;       //STUB  Move to somewhere elsed
        
        // this.task.current(this);
        // const entity = this;
        // timeout(new Promise((resolve, reject) => {
        //     resolve(entity.onTurn());
        // }), GCD);




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
    
            this.task.current(this);
    
            this.task.timeout = setTimeout(this.onTurn.bind(this), GCD);
            this.task.timeoutStart = Date.now();
        }

        
    }
    offTurn() {
        clearInterval(this.task.timeout);
        this.task.timeout = void 0;
        this.task.timeoutStart = 0;
    }
}

export default Entity;