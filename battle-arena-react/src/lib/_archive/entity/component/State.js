import Component from "./Component";
import SubState from "./lib/State";

export const EnumState = {
    IDLE: 0,
    MOVING: 1,
    CASTING: 2,
    DEAD: 3,
    FAINTED: 4,
};

export class State extends Component {
    static Name = "state";
    static DefaultProperties = () => ({
        _current: null,
        default: null,
    });

    constructor(game, entity, state = {}) {
        super(State.Name, game, entity, {
            ...State.DefaultProperties(),
            default: Component.Invoke(SubState, [
                Component.GetArgsKey(state, "type") || EnumState.IDLE,
                Infinity,
            ]),
            ...state,
        });
        
        this.current = this.default;
    }

    get current() {
        if(!this._current) {
            this._current = this.default;
        }

        return this._current;
    }
    set current(current) {
        if(current instanceof SubState) {
            this._current = current;
            this.meta = current.meta;
        }
    }

    alter(...args) {
        if(args.length === 1) {
            if(args[ 0 ] instanceof SubState) {
                this.current = args[ 0 ];
            } else if(typeof args[ 0 ] === "function") {
                this.current = args[ 0 ](this);
            }
        } else {
            this.current = new SubState(...args);
        }

        return this;
    }    
    change(type, duration, meta = {}) {
        this.current = new SubState(type, duration, { meta });

        return this;
    }

    onPreTick(spf, now) {
        if(this.current.isComplete) {
            if(typeof this.current.next === "function") {
                this.alter(this.current.next);
            } else {
                this.alter(this.default);
            }
        }
    }
};

export default State;