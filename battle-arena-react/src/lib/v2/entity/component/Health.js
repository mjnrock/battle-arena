import Component from "./Component";
import Value from "./../../util/Value";

export class Health extends Component {
    static Name = "health";
    static DefaultProperties = () => ({
        value: null,
        cat: null,
    });

    constructor(game, entity, state = {}) {
        super(Health.Name, game, entity, {
            ...Health.DefaultProperties(),
            value: Component.Invoke(Value, [
                Component.GetArgsKey(state, "current"),
                { min: Component.GetArgsKey(state, "min") || 0, max: Component.GetArgsKey(state, "max") },
            ]),
            ...state,
        });
    }
};

export default Health;