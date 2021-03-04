export class Sequence {
    constructor(score) {
        this.score = score;

        this.duration = this.getTotalTime();

        if(Array.isArray(this.score)) {  // no source data
            this.pattern = this.score;
        } else if(typeof this.score === "object") {  // source data
            this.pattern = this.score.pattern;
        } else {
            return false;
        }
    }

    getTotalTime() {
        if(Array.isArray(this.score)) {  // no source data
            return this.score.reduce((a, [ key, dur ]) => {
                return a + dur;
            }, 0);
        } else if(typeof this.score === "object") {  // source data
            return this.score.pattern.reduce((a, [ key, dur ]) => {
                return a + dur;
            }, 0);
        }
    }

    getKey(elapsed) {
        elapsed = elapsed % this.duration;  // Loop pattern

        let time = 0;
        for(let i = 0; i < this.pattern.length; i++) {
            const [ key, dur ] = this.pattern[ i ];

            if(elapsed <= time + dur) {
                return key;
            }

            time += dur;
        }
    }
}

export default Sequence;