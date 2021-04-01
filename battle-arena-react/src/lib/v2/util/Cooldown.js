export class Cooldown {
    static EnumStatus = {
        INACTIVE: 0,
        ACTIVE: 1,
        COMPLETE: 2,
    };

    constructor(duration) {
        this.start = null;
        this.duration = duration;
        this.status = EnumStatus.INACTIVE;
    }

    start() {
        if(this.status === EnumStatus.INACTIVE) {
            this.start = Date.now();
        }
    }

    get progress() {
        if(this.status === EnumStatus.ACTIVE) {
            const now = Date.now();
            const elapsed = now - this.start;

            if(elapsed >= this.duration) {
                return 1.0;
            }

            return elapsed / this.duration;
        }
    }
    get isComplete() {
        return this.progress === 1;
    }
};

export default Cooldown;