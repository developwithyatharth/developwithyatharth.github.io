import Engine from "./core/Engine.js";

import Game from "./core/Game.js";

const canvas=

document.getElementById(

    "gameCanvas"

);

const engine=

new Engine(

    canvas

).getEngine();

const game=

new Game(

    engine

);

await game.initialize();

game.start();

window.addEventListener(

    "resize",

    ()=>{

        engine.resize();

    }

);
