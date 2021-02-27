/* eslint-disable */
import React from "react";
import { Segment } from "semantic-ui-react";

import GameView from "../components/v2/GameView";
import MetaView from "../components/v2/MetaView";

export default function Home() {
    return (
        <Segment textAlign="center">
            <GameView />
            <MetaView />
        </Segment>
    )
}