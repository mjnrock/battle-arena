import Component from "./Component";

export class Action extends Component {
    static Name = "action";
    static DefaultProperties = () => ({
        current: entity => {},
        cooldown: null,
        actions: {},
        queue: new Set(),
    });

    constructor(game, entity, state = {}) {
        super(Action.Name, game, entity, {
            ...Action.DefaultProperties(),
            ...state,
        });
    }
};

export default Action;