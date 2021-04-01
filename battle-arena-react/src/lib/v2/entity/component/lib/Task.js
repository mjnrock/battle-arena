import Cooldown from "../../../util/Cooldown";

export class Task {
    constructor({ executer, activator, cooldown } = {}) {
        this.executer = executer;
        this.activator = activator || (() => true);
        this.__cooldown = cooldown;
    }

    cooldown() {
        return new Cooldown(this.__cooldown || 0);
    }

    perform(game, entity, ...args) {
        if(this.activator(game, entity, ...args) === true) {
            this.executer(game, entity, ...args);

            return this.cooldown();
        }
    }
};

export function Create({ executer, activator, cooldown } = {}) {
    return new Task({ executer, activator, cooldown });
};
export function Perform(obj = {}, game, entity, ...args) {
    return (new Task(obj)).perform(game, entity, ...args);
};

Task.Create = Create;
Task.Perform = Perform;

export default Task;