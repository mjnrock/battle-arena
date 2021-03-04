export class Sequence {
    constructor(score) {
        this.score = score;

        this.duration = this.getTotalTime();
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
        let pattern;
        if(Array.isArray(this.score)) {  // no source data
            pattern = this.score;
        } else if(typeof this.score === "object") {  // source data
            pattern = this.score.pattern;
        }

        elapsed = elapsed % this.duration;
        let time = 0;
        for(let i = 0; i < pattern.length; i++) {
            const [ key, dur ] = pattern[ i ];

            if(elapsed <= time + dur) {
                return key;
            }

            time += dur;
        }
    }
}

export default Sequence;