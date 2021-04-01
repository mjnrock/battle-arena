import Cooldown from "../../../util/Cooldown";

export class Task {
    constructor({ executer, activator, cooldown } = {}) {
        this.executer = executer;
        this.activator = activator || (() => true);
        this.__cooldown = cooldown;
    }

    cooldown() {
        return new Cooldown(this.__cooldown);
    }

    perform(game, entity, ...args) {
        if(this.activator(game, entity, ...args) === true) {
            this.executer(game, entity, ...args);

            return this.cooldown();
        }
    }
};

export default Task;