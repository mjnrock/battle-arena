import Sequence from "./Sequence";

export class Tessellation {
    constructor(tessellationObj = {}) {
        if(typeof tessellationObj !== "object") {
            this.source = JSON.parse(tessellationObj);
        } else {
            this.source = tessellationObj;
        }

        this.mode = "absolute";
        this.data = [];
    }

    clear() {
        this.data = [];

        return this;
    }
    absolute() {
        this.mode = "absolute";
        
        return this.clear();
    }
    relative(bps) {
        this.mode = "relative";

        this.clear();

        return this.bps(bps);
    }

    bps(bps) {
        if(this.mode === "relative") {  // Skip function if not in "relative" mode
            if(!this.data.length) {     // No data presently entered, add
                this.data.push(bps);
            } else {
                if(Array.isArray(this.data[ 0 ])) {     // No BPS in the first slot, add
                    this.data.unshift(bps);
                } else {        // BPS present in the first slot, overwrite
                    this.data[ 0 ] = bps;
                }
            }
        }

        return this;
    }

    add(key, duration, repeat = 1) {
        this.data.push([
            key,
            duration,
            repeat,
        ]);

        return this;
    }

    score(includeSource = false) {
        let pattern;
        if(this.mode === "absolute") {
            pattern = [ ...this.data ].map(([ key, duration, repeat ]) => {
                return [ key, duration * repeat ];
            });
        } else if(this.mode === "relative") {
            const bps = this.data[ 0 ];
            
            pattern = [ ...this.data ].slice(1).map(([ key, duration, repeat ]) => {
                return [ key, duration / bps * 1000 * repeat ];
            });
        }

        if(includeSource) {
            return {
                source: this.source,
                pattern,
            };
        }

        return pattern;
    }

    toSequence(includeSource = false) {
        return new Sequence(this.score(includeSource));
    }
}

export default Tessellation;