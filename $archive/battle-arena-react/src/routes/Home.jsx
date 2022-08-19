/* eslint-disable */
import React from "react";
import { Segment } from "semantic-ui-react";

import GameView from "../components/GameView";
// import MetaView from "../components/MetaView";

export default function Home() {
    return (
        <Segment textAlign="center" inverted basic>
            <GameView />
            {/* <MetaView /> */}
        </Segment>
    )
}