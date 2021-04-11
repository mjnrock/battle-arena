import Component from "./Component";

export class Effect extends Component {
    static Name = "effect";
    static DefaultProperties = () => ({
        isActive: true,
        qualifier: null,
        effect: null,
        args: null,
        respawn: 0,
    });

    constructor(game, entity, state = {}) {
        super(Effect.Name, game, entity, {
            ...Effect.DefaultProperties(),
            ...state,
        });
    }
};

export default Effect;