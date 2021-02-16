/* eslint-disable */
import { useState } from "react";
import { Segment } from "semantic-ui-react";

import Grid from "./lib/Grid";

const root = {
    grid: new Grid({ width: 10, height: 6, seed: (x, y) => `${ x }.${ y }` }),
};

function App() {
    const [ state, setState ] = useState({
        current: null,
    });

    return (
        <Segment>
            <Segment>
                Current: { state.current }
            </Segment>

            <div className="flex">
                {
                    Array.from({ length: root.grid.width }, (v, i) => (
                        <div
                            key={ i }
                            className="ba-cell pa3 ma1"
                        >{ i }</div>
                    ))
                }
            </div>
            {
                root.grid.toArray().map((row, i) => {
                    return (
                        <div
                            key={ row.toString() }
                            className="flex"
                        >
                            <div
                                key={ i }
                                className="ba-cell pa3"
                            >{ i }</div>
                            {
                                row.map(cell => (
                                    <div
                                        key={ cell }
                                        className="ba-cell pa3 b br2 ba ma1"
                                        onMouseOver={ e => setState({ current: cell })}
                                    >{ cell }</div>
                                ))
                            }
                        </div>
                    )
                })
            }
        </Segment>
    );
}

export default App;