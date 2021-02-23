/* eslint-disable */
import React from "react";

import GameView from "../components/GameView";

import Choice from "../lib/Choice";

export default function Home() {
    let choice = new Choice(() => false);
    let subchoice = new Choice(() => true);
    choice.T(() => 5);
    choice.F(subchoice);
    subchoice.T(() => true);
    subchoice.F(() => false);

    console.log(choice.run());

    return (
        <GameView />
    )
}