/*=========================================================
  EazyPezy Puzzle Challenge
  Version : 2.0
  Module 1 : Core Game Engine
=========================================================*/

"use strict";

/*=========================================================
    GLOBAL GAME OBJECT
=========================================================*/

const GAME = {

    // Player
    playerName: "",

    // Progress
    currentPuzzle: 0,
    totalPuzzles: 10,

    // Score
    score: 0,

    // Health
    lives: 3,

    // Hint System
    hints: 3,
    hintsUsed: 0,

    // Statistics
    solved: 0,
    wrongAnswers: 0,

    // Timer
    timer: 0,
    timerInterval: null,

    // Puzzle State
    selectedAnswer: null,
    answered: false,

    // Flags
    started: false,
    finished: false

};


/*=========================================================
    DOM CACHE
=========================================================*/

const DOM = {

loadingScreen:
document.getElementById("loadingScreen"),

welcomeScreen:
document.getElementById("welcomeScreen"),

playerScreen:
document.getElementById("playerScreen"),

instructionScreen:
document.getElementById("instructionScreen"),

gameScreen:
document.getElementById("gameScreen"),

gameOverScreen:
document.getElementById("gameOverScreen"),

resultScreen:
document.getElementById("resultScreen"),

playerInput:
document.getElementById("playerName"),

nameError:
document.getElementById("nameError"),

displayName:
document.getElementById("displayName"),

winnerName:
document.getElementById("winnerName"),

startBtn:
document.getElementById("startBtn"),

continueBtn:
document.getElementById("continueBtn"),

beginBtn:
document.getElementById("beginGame"),

restartBtn:
document.getElementById("restartGame"),

playAgainBtn:
document.getElementById("playAgain"),

homeBtn:
document.getElementById("goHome"),

lives:
document.getElementById("lives"),

score:
document.getElementById("score"),

timer:
document.getElementById("timer"),

hintCount:
document.getElementById("hintCount"),

currentPuzzle:
document.getElementById("currentPuzzle"),

progressFill:
document.getElementById("progressFill")

};


/*=========================================================
    SCREEN MANAGER
=========================================================*/

const SCREENS = [

DOM.loadingScreen,

DOM.welcomeScreen,

DOM.playerScreen,

DOM.instructionScreen,

DOM.gameScreen,

DOM.gameOverScreen,

DOM.resultScreen

];


function hideAllScreens(){

SCREENS.forEach(screen=>{

screen.classList.remove("active");

});

}


function showScreen(screen){

hideAllScreens();

screen.classList.add("active");

}


/*=========================================================
    LOCAL STORAGE
=========================================================*/

function savePlayer(){

localStorage.setItem(

"EazyPezy_Player",

GAME.playerName

);

}


function loadPlayer(){

const saved=

localStorage.getItem(

"EazyPezy_Player"

);

if(saved){

GAME.playerName=saved;

DOM.playerInput.value=saved;

}

}


/*=========================================================
    VALIDATION
=========================================================*/

function validateName(name){

const regex=/^[A-Za-z ]{3,25}$/;

return regex.test(name.trim());

}


/*=========================================================
    LOADING SCREEN
=========================================================*/

window.addEventListener("load",()=>{

loadPlayer();

setTimeout(()=>{

showScreen(

DOM.welcomeScreen

);

},1800);

});


/*=========================================================
    START BUTTON
=========================================================*/

DOM.startBtn.addEventListener(

"click",

()=>{

showScreen(

DOM.playerScreen

);

DOM.playerInput.focus();

}

);


/*=========================================================
    PLAYER REGISTRATION
=========================================================*/

DOM.continueBtn.addEventListener(

"click",

registerPlayer

);


DOM.playerInput.addEventListener(

"keydown",

(e)=>{

if(e.key==="Enter"){

registerPlayer();

}

}

);


function registerPlayer(){

const value=

DOM.playerInput.value.trim();

if(!validateName(value)){

DOM.nameError.textContent=

"Please enter a valid name.";

return;

}

DOM.nameError.textContent="";

GAME.playerName=value;

savePlayer();

DOM.displayName.textContent=value;

DOM.winnerName.textContent=value;

showScreen(

DOM.instructionScreen

);

}


/*=========================================================
    BEGIN GAME
=========================================================*/

DOM.beginBtn.addEventListener(

"click",

()=>{

startGame();

}

);


function startGame(){

GAME.started=true;

GAME.finished=false;

GAME.currentPuzzle=0;

GAME.score=0;

GAME.lives=3;

GAME.hints=3;

GAME.hintsUsed=0;

GAME.solved=0;

GAME.wrongAnswers=0;

GAME.timer=0;

GAME.selectedAnswer=null;

GAME.answered=false;

updateHUD();

startTimer();

showScreen(

DOM.gameScreen

);

/*

Puzzle Loader

Added

in Module 3

*/

if(typeof renderPuzzle==="function"){

renderPuzzle();

}

}


/*=========================================================
    HUD
=========================================================*/

function updateHUD(){

DOM.lives.textContent=

GAME.lives;

DOM.score.textContent=

GAME.score;

DOM.timer.textContent=

formatTime(

GAME.timer

);

DOM.hintCount.textContent=

GAME.hints;

DOM.currentPuzzle.textContent=

GAME.currentPuzzle+1;

updateProgress();

}


function updateProgress(){

const progress=

((GAME.currentPuzzle+1)

/

GAME.totalPuzzles)

*100;

DOM.progressFill.style.width=

progress+"%";

}


/*=========================================================
    TIMER
=========================================================*/

function startTimer(){

clearInterval(

GAME.timerInterval

);

GAME.timerInterval=

setInterval(()=>{

GAME.timer++;

DOM.timer.textContent=

formatTime(

GAME.timer

);

},1000);

}


function stopTimer(){

clearInterval(

GAME.timerInterval

);

}


function formatTime(seconds){

const min=

String(

Math.floor(seconds/60)

).padStart(2,"0");

const sec=

String(

seconds%60

).padStart(2,"0");

return `${min}:${sec}`;

}


/*=========================================================
    RESTART
=========================================================*/

function restartGame(){

stopTimer();

showScreen(

DOM.welcomeScreen

);

}


DOM.restartBtn.addEventListener(

"click",

restartGame

);

DOM.playAgainBtn.addEventListener(

"click",

restartGame

);

DOM.homeBtn.addEventListener(

"click",

restartGame

);


/*=========================================================
    PLACEHOLDER FUNCTIONS
    (Implemented Later)
=========================================================*/

function renderPuzzle(){}

function checkAnswer(){}

function nextPuzzle(){}

function useHint(){}

function finishGame(){}

function gameOver(){}


/*=========================================================
    MODULE 1 COMPLETE
=========================================================*/
/*=========================================================
  EazyPezy Puzzle Challenge
  Version : 2.0
  Module 2 : Puzzle Database
=========================================================*/

/*=========================================================
    PUZZLE DATABASE
=========================================================*/

const PUZZLES = [

/*======================================================
  Puzzle 1
======================================================*/

{
    id:1,

    type:"sequence",

    difficulty:"Easy",

    score:100,

    title:"Puzzle 1",

    question:"What number comes next?\n\n2, 4, 8, 16, ?",

    options:[
        "18",
        "24",
        "32",
        "36"
    ],

    correct:2,

    hint:"Each number is doubled.",

    explanation:"2 → 4 → 8 → 16 → 32"

},

/*======================================================
  Puzzle 2
======================================================*/

{
    id:2,

    type:"pattern",

    difficulty:"Easy",

    score:100,

    title:"Puzzle 2",

    question:"Find the missing letter.\n\nA, C, F, J, ?",

    options:[
        "K",
        "L",
        "O",
        "P"
    ],

    correct:2,

    hint:"The jump increases by one every time.",

    explanation:"+2 +3 +4 +5"

},

/*======================================================
  Puzzle 3
======================================================*/

{
    id:3,

    type:"emoji",

    difficulty:"Easy",

    score:100,

    title:"Puzzle 3",

    question:
`🐱 + 🐱 = 10

🐱 + 🐶 = 12

🐶 + 🐶 = ?`,

    options:[
        "10",
        "12",
        "14",
        "16"
    ],

    correct:2,

    hint:"Find one cat first."

},

/*======================================================
  Puzzle 4
======================================================*/

{
    id:4,

    type:"memory",

    difficulty:"Medium",

    score:120,

    title:"Puzzle 4",

    question:
"Remember these words:\n\nBLUE\nRED\nGREEN\nYELLOW",

    memory:[
        "BLUE",
        "RED",
        "GREEN",
        "YELLOW"
    ],

    options:[
        "Blue",
        "Green",
        "Yellow",
        "Red"
    ],

    memoryQuestion:
"Which colour was THIRD?",

    correct:1,

    hint:"Focus on the order."

},

/*======================================================
  Puzzle 5
======================================================*/

{
    id:5,

    type:"scramble",

    difficulty:"Medium",

    score:120,

    title:"Puzzle 5",

    question:"Unscramble the word:\n\nATC",

    options:[
        "Dog",
        "Rat",
        "Cat",
        "Cow"
    ],

    correct:2,

    hint:"A common pet."

},

/*======================================================
  Puzzle 6
======================================================*/

{
    id:6,

    type:"odd",

    difficulty:"Medium",

    score:120,

    title:"Puzzle 6",

    question:"Which one is different?",

    options:[
        "Rose",
        "Lotus",
        "Tiger",
        "Sunflower"
    ],

    correct:2,

    hint:"Only one isn't a plant."

},

/*======================================================
  Puzzle 7
======================================================*/

{
    id:7,

    type:"cipher",

    difficulty:"Hard",

    score:150,

    title:"Puzzle 7",

    question:"Decode:\n\n3 - 1 - 20",

    options:[
        "Dog",
        "Cat",
        "Rat",
        "Bat"
    ],

    correct:1,

    hint:"A = 1"

},

/*======================================================
  Puzzle 8
======================================================*/

{
    id:8,

    type:"logic",

    difficulty:"Hard",

    score:150,

    title:"Puzzle 8",

    question:
"If\n\n5 + 3 = 28\n\n7 + 2 = 45\n\nThen\n\n6 + 4 = ?",

    options:[
        "20",
        "24",
        "28",
        "36"
    ],

    correct:0,

    hint:"Think about squares."

},

/*======================================================
  Puzzle 9
======================================================*/

{
    id:9,

    type:"riddle",

    difficulty:"Hard",

    score:150,

    title:"Puzzle 9",

    question:
"I have keys but no locks.\nI have space but no rooms.\nWhat am I?",

    options:[
        "Keyboard",
        "Clock",
        "Map",
        "Book"
    ],

    correct:0,

    hint:"You probably use it every day."

},

/*======================================================
  Puzzle 10
======================================================*/

{
    id:10,

    type:"final",

    difficulty:"Expert",

    score:200,

    title:"Final Puzzle",

    question:
"Which quality helped you finish EazyPezy?",

    options:[
        "Luck",
        "Logic",
        "Magic",
        "Guessing"
    ],

    correct:1,

    hint:"The whole game was based on it."

}

];


/*=========================================================
    PUZZLE HELPER FUNCTIONS
=========================================================*/

function getCurrentPuzzle(){

    return PUZZLES[GAME.currentPuzzle];

}

function getPuzzleCount(){

    return PUZZLES.length;

}

function isLastPuzzle(){

    return GAME.currentPuzzle >= PUZZLES.length - 1;

}

function hasMorePuzzles(){

    return GAME.currentPuzzle < PUZZLES.length - 1;

}


/*=========================================================
    PUZZLE RESET
=========================================================*/

function resetPuzzleState(){

    GAME.selectedAnswer = null;

    GAME.answered = false;

}


/*=========================================================
    HINT TRACKER
=========================================================*/

const HINT_HISTORY = {};

function markHintUsed(id){

    HINT_HISTORY[id] = true;

}

function hasHintBeenUsed(id){

    return HINT_HISTORY[id] === true;

}


/*=========================================================
    PLAYER ANSWER HISTORY
=========================================================*/

const ANSWER_HISTORY = [];


function savePlayerAnswer(puzzleId,answerIndex,isCorrect){

    ANSWER_HISTORY.push({

        puzzle:puzzleId,

        answer:answerIndex,

        correct:isCorrect,

        time:GAME.timer

    });

}


/*=========================================================
    MODULE 2 COMPLETE
=========================================================*/
/*=========================================================
  EazyPezy Puzzle Challenge
  Version : 2.0
  Module 3
  Puzzle Renderer
=========================================================*/


/*=========================================================
    DOM REFERENCES
=========================================================*/

const questionTitle =
document.getElementById("questionTitle");

const questionText =
document.getElementById("questionText");

const optionContainer =
document.getElementById("options");

const nextButton =
document.getElementById("nextBtn");

const hintButton =
document.getElementById("hintBtn");

const hintModal =
document.getElementById("hintModal");

const hintText =
document.getElementById("hintText");

const closeHint =
document.getElementById("closeHint");


/*=========================================================
    RENDER CURRENT PUZZLE
=========================================================*/

function renderPuzzle(){

    resetPuzzleState();

    updateHUD();

    const puzzle = getCurrentPuzzle();

    if(!puzzle){

        finishGame();

        return;

    }

    questionTitle.textContent = puzzle.title;

    questionText.innerHTML =
    puzzle.question.replace(/\n/g,"<br>");

    optionContainer.innerHTML = "";

    nextButton.disabled = true;

    createOptions(puzzle);

}


/*=========================================================
    CREATE OPTION BUTTONS
=========================================================*/

function createOptions(puzzle){

    puzzle.options.forEach((option,index)=>{

        const button =
        document.createElement("button");

        button.className = "option";

        button.innerHTML = option;

        button.dataset.index = index;

        button.addEventListener(

            "click",

            ()=>selectOption(button,index)

        );

        optionContainer.appendChild(button);

    });

}


/*=========================================================
    SELECT OPTION
=========================================================*/

function selectOption(button,index){

    if(GAME.answered) return;

    document
    .querySelectorAll(".option")
    .forEach(btn=>{

        btn.classList.remove("selected");

    });

    button.classList.add("selected");

    GAME.selectedAnswer = index;

    nextButton.disabled = false;

}


/*=========================================================
    HINT BUTTON
=========================================================*/

hintButton.addEventListener(

    "click",

    ()=>{

        const puzzle =
        getCurrentPuzzle();

        if(!puzzle) return;

        if(GAME.hints<=0){

            hintText.innerHTML =
            "No hints remaining.";

        }

        else if(

            hasHintBeenUsed(
                puzzle.id
            )

        ){

            hintText.innerHTML =
            "Hint already used for this puzzle.";

        }

        else{

            hintText.innerHTML =
            puzzle.hint;

            GAME.hints--;

            GAME.hintsUsed++;

            markHintUsed(
                puzzle.id
            );

            updateHUD();

        }

        hintModal.classList.add(
            "active"
        );

    }

);


/*=========================================================
    CLOSE HINT
=========================================================*/

closeHint.addEventListener(

    "click",

    ()=>{

        hintModal.classList.remove(
            "active"
        );

    }

);


/*=========================================================
    MEMORY PUZZLE
=========================================================*/

function startMemoryPuzzle(){

    const puzzle =
    getCurrentPuzzle();

    if(
        puzzle.type!=="memory"
    ) return;

    optionContainer.innerHTML="";

    questionText.innerHTML =
    puzzle.memory.join("<br>");

    let countdown = 5;

    const interval =

    setInterval(()=>{

        questionTitle.textContent =
        `Remember (${countdown})`;

        countdown--;

        if(countdown<0){

            clearInterval(interval);

            questionTitle.textContent =
            puzzle.title;

            questionText.innerHTML =
            puzzle.memoryQuestion;

            createOptions(puzzle);

        }

    },1000);

}


/*=========================================================
    LOAD SPECIAL PUZZLES
=========================================================*/

function initializePuzzle(){

    const puzzle =
    getCurrentPuzzle();

    if(
        puzzle.type==="memory"
    ){

        startMemoryPuzzle();

        return;

    }

    createOptions(puzzle);

}


/*=========================================================
    OVERRIDE RENDER
=========================================================*/

const oldRender =
renderPuzzle;

renderPuzzle = function(){

    resetPuzzleState();

    updateHUD();

    const puzzle =
    getCurrentPuzzle();

    if(!puzzle){

        finishGame();

        return;

    }

    questionTitle.textContent =
    puzzle.title;

    optionContainer.innerHTML="";

    nextButton.disabled=true;

    if(
        puzzle.type==="memory"
    ){

        startMemoryPuzzle();

        return;

    }

    questionText.innerHTML =
    puzzle.question.replace(/\n/g,"<br>");

    createOptions(puzzle);

};


/*=========================================================
    NEXT BUTTON
=========================================================*/

nextButton.addEventListener(

    "click",

    ()=>{

        checkAnswer();

    }

);


/*=========================================================
    MODULE 3 COMPLETE
=========================================================*/
/*=========================================================
  EazyPezy Puzzle Challenge
  Version : 2.0
  Module 4
  Answer Engine
=========================================================*/


/*=========================================================
    CHECK ANSWER
=========================================================*/

checkAnswer = function(){

    if(GAME.selectedAnswer===null){

        return;

    }

    if(GAME.answered){

        return;

    }

    GAME.answered=true;

    const puzzle=getCurrentPuzzle();

    const buttons=document.querySelectorAll(".option");

    const correctIndex=puzzle.correct;

    buttons.forEach((button,index)=>{

        button.disabled=true;

        if(index===correctIndex){

            button.classList.add("correct");

        }

    });

    const isCorrect=

    GAME.selectedAnswer===correctIndex;

    if(isCorrect){

        handleCorrectAnswer();

    }

    else{

        buttons[GAME.selectedAnswer]

        .classList.add("wrong");

        handleWrongAnswer();

    }

    savePlayerAnswer(

        puzzle.id,

        GAME.selectedAnswer,

        isCorrect

    );

};


/*=========================================================
    CORRECT ANSWER
=========================================================*/

function handleCorrectAnswer(){

    const puzzle=getCurrentPuzzle();

    let earned=puzzle.score;

    if(

        hasHintBeenUsed(

            puzzle.id

        )

    ){

        earned=Math.floor(

            earned*0.75

        );

    }

    GAME.score+=earned;

    GAME.solved++;

    updateHUD();

    nextButton.disabled=false;

    nextButton.textContent=

    isLastPuzzle()

    ?

    "Finish"

    :

    "Next →";

}


/*=========================================================
    WRONG ANSWER
=========================================================*/

function handleWrongAnswer(){

    GAME.lives--;

    GAME.wrongAnswers++;

    updateHUD();

    if(GAME.lives<=0){

        setTimeout(()=>{

            gameOver();

        },1200);

        return;

    }

    setTimeout(()=>{

        nextButton.disabled=false;

        nextButton.textContent="Next →";

    },900);

}


/*=========================================================
    NEXT PUZZLE
=========================================================*/

nextPuzzle=function(){

    GAME.currentPuzzle++;

    if(

        GAME.currentPuzzle>=

        getPuzzleCount()

    ){

        finishGame();

        return;

    }

    renderPuzzle();

};


/*=========================================================
    NEXT BUTTON
=========================================================*/

nextButton.onclick=function(){

    if(!GAME.answered){

        checkAnswer();

    }

    else{

        nextPuzzle();

    }

};


/*=========================================================
    GAME OVER
=========================================================*/

gameOver=function(){

    stopTimer();

    document.getElementById(

        "gameOverScore"

    ).textContent=

    GAME.score;

    showScreen(

        DOM.gameOverScreen

    );

};


/*=========================================================
    FINISH GAME
=========================================================*/

finishGame=function(){

    stopTimer();

    GAME.finished=true;

    showResults();

};


/*=========================================================
    CALCULATE RANK
=========================================================*/

function calculateRank(){

    if(GAME.score>=1300)

        return "Legend";

    if(GAME.score>=1000)

        return "Master";

    if(GAME.score>=700)

        return "Thinker";

    return "Explorer";

}


/*=========================================================
    SHOW RESULTS
=========================================================*/

function showResults(){

    document.getElementById(

        "finalScore"

    ).textContent=

    GAME.score;

    document.getElementById(

        "remainingLives"

    ).textContent=

    GAME.lives;

    document.getElementById(

        "usedHints"

    ).textContent=

    GAME.hintsUsed;

    document.getElementById(

        "finalTime"

    ).textContent=

    formatTime(

        GAME.timer

    );

    document.getElementById(

        "finalRank"

    ).textContent=

    calculateRank();

    showScreen(

        DOM.resultScreen

    );

};


/*=========================================================
    MODULE 4 COMPLETE
=========================================================*/
/*=========================================================
  EazyPezy Puzzle Challenge
  Version : 2.0
  Module 5
  Final Polish & Effects
=========================================================*/


/*=========================================================
    SAVE GAME
=========================================================*/

function saveGame(){

    const saveData={

        playerName:GAME.playerName,

        currentPuzzle:GAME.currentPuzzle,

        score:GAME.score,

        lives:GAME.lives,

        hints:GAME.hints,

        hintsUsed:GAME.hintsUsed,

        solved:GAME.solved,

        wrongAnswers:GAME.wrongAnswers,

        timer:GAME.timer

    };

    localStorage.setItem(

        "EazyPezy_Save",

        JSON.stringify(saveData)

    );

}


/*=========================================================
    LOAD SAVED GAME
=========================================================*/

function loadSavedGame(){

    const data=

    localStorage.getItem(

        "EazyPezy_Save"

    );

    if(!data) return false;

    const save=

    JSON.parse(data);

    Object.assign(

        GAME,

        save

    );

    updateHUD();

    return true;

}


/*=========================================================
    CLEAR SAVE
=========================================================*/

function clearSave(){

    localStorage.removeItem(

        "EazyPezy_Save"

    );

}


/*=========================================================
    AUTO SAVE
=========================================================*/

const originalNextPuzzle=nextPuzzle;

nextPuzzle=function(){

    saveGame();

    originalNextPuzzle();

};


/*=========================================================
    SCORE ANIMATION
=========================================================*/

function animateScore(target){

    let current=

    Number(DOM.score.textContent);

    clearInterval(

        window.scoreAnimation

    );

    window.scoreAnimation=

    setInterval(()=>{

        if(current>=target){

            clearInterval(

                window.scoreAnimation

            );

            DOM.score.textContent=target;

            return;

        }

        current+=5;

        if(current>target){

            current=target;

        }

        DOM.score.textContent=current;

    },15);

}


/*=========================================================
    IMPROVED HUD
=========================================================*/

const previousUpdateHUD=

updateHUD;

updateHUD=function(){

    DOM.lives.textContent=

    GAME.lives;

    DOM.hintCount.textContent=

    GAME.hints;

    DOM.currentPuzzle.textContent=

    GAME.currentPuzzle+1;

    DOM.timer.textContent=

    formatTime(GAME.timer);

    animateScore(GAME.score);

    updateProgress();

};


/*=========================================================
    RANK MESSAGE
=========================================================*/

function getRankMessage(rank){

    switch(rank){

        case "Legend":

            return

            "Outstanding! You mastered every challenge.";

        case "Master":

            return

            "Excellent logical thinking!";

        case "Thinker":

            return

            "Great job. Keep improving.";

        default:

            return

            "Nice start. Try again for a higher rank.";

    }

}


/*=========================================================
    CONFETTI
=========================================================*/

const canvas=

document.getElementById(

    "confettiCanvas"

);

const ctx=

canvas.getContext("2d");

canvas.width=

window.innerWidth;

canvas.height=

window.innerHeight;


let confetti=[];


function createConfetti(){

    confetti=[];

    for(let i=0;i<180;i++){

        confetti.push({

            x:Math.random()*canvas.width,

            y:Math.random()*canvas.height-canvas.height,

            size:5+Math.random()*8,

            speed:2+Math.random()*4,

            angle:Math.random()*360

        });

    }

}


function drawConfetti(){

    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

    confetti.forEach(piece=>{

        ctx.save();

        ctx.translate(

            piece.x,

            piece.y

        );

        ctx.rotate(

            piece.angle

        );

        ctx.fillRect(

            0,

            0,

            piece.size,

            piece.size

        );

        ctx.restore();

        piece.y+=piece.speed;

        piece.angle+=0.05;

    });

}


function runConfetti(){

    createConfetti();

    let frame=0;

    const animation=

    setInterval(()=>{

        drawConfetti();

        frame++;

        if(frame>260){

            clearInterval(animation);

            ctx.clearRect(

                0,

                0,

                canvas.width,

                canvas.height

            );

        }

    },16);

}


/*=========================================================
    IMPROVED RESULTS
=========================================================*/

const originalShowResults=

showResults;

showResults=function(){

    originalShowResults();

    runConfetti();

    const rank=

    calculateRank();

    const message=

    getRankMessage(rank);

    const resultCard=

    document.querySelector(

        "#resultScreen .card"

    );

    let note=

    document.getElementById(

        "rankMessage"

    );

    if(!note){

        note=document.createElement("p");

        note.id="rankMessage";

        note.style.marginTop="20px";

        note.style.fontWeight="600";

        resultCard.appendChild(note);

    }

    note.textContent=message;

    clearSave();

};


/*=========================================================
    WINDOW RESIZE
=========================================================*/

window.addEventListener(

    "resize",

    ()=>{

        canvas.width=

        window.innerWidth;

        canvas.height=

        window.innerHeight;

    }

);


/*=========================================================
    BETTER RESTART
=========================================================*/

const originalRestart=

restartGame;

restartGame=function(){

    clearSave();

    originalRestart();

};


/*=========================================================
    MODULE 5 COMPLETE
=========================================================*/
