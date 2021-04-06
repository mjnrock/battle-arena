export class Cooldown {
    constructor(duration) {
        this.start = Date.now();
        this.duration = duration;
    }

    get progress() {
        const now = Date.now();
        const elapsed = now - this.start;

        // if(elapsed >= this.duration) {
        //     return 1.0;
        // }

        return elapsed / this.duration;
    }
    get isComplete() {
        return this.progress >= 1;
    }

    static Generate(cooldown) {
        if(cooldown instanceof Cooldown) {
            return new Cooldown(cooldown.duration);
        }

        return new Cooldown(+cooldown);
    }
};

export default Cooldown;