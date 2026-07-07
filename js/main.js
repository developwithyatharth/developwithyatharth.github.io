import GameManager from "./managers/GameManager.js";

window.addEventListener("DOMContentLoaded", async () => {

    const game = new GameManager();

    await game.initialize();

    game.start();

});
