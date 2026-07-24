const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//score 
let score = 0;
let scored = false;
// Bird properties
let birdX = 100;
let birdY = 200;
let birdRadius = 20;

// Gravity
let gravity = 0.5;
let velocity = 0;
const flapStrength = -8;

// Ground
const groundHeight = 100;
const groundY = canvas.height - groundHeight;

// Pipe
let pipeX = canvas.width;
const pipeWidth = 70;
let pipeHeight = 250;
const pipeSpeed = 2;
const pipeGap = 180;

let gameOver = false;


function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(birdX, birdY, birdRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawGround()

 {
    ctx.fillStyle = "green";
    ctx.fillRect(0, groundY, canvas.width, groundHeight);
}
function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, 20, 40);
}
function drawGameOver() {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", 85, 250);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Press R to Restart", 105, 290);
}
function drawPipe() {
    ctx.fillStyle = "green";

    // Top pipe
    ctx.fillRect(pipeX, 0, pipeWidth, pipeHeight);

    // Bottom pipe
    ctx.fillRect(
        pipeX,
        pipeHeight + pipeGap,
        pipeWidth,
        canvas.height - (pipeHeight + pipeGap) - groundHeight
    );
}

function checkCollision() {

    // Bird hits top pipe
    if (
        birdX + birdRadius > pipeX &&
        birdX - birdRadius < pipeX + pipeWidth &&
        birdY - birdRadius < pipeHeight
    ) {
        gameOver = true;
    }

    // Bird hits bottom pipe
    if (
        birdX + birdRadius > pipeX &&
        birdX - birdRadius < pipeX + pipeWidth &&
        birdY + birdRadius > pipeHeight + pipeGap
    ) {
        gameOver = true;
    }
}

function restartGame() {
    birdY = 200;
    velocity = 0;

    pipeX = canvas.width;
    pipeHeight = 250;

    gameOver = false;

    gameLoop();
}

document.addEventListener("keydown", function (event) {

    if (event.code === "Space") {
        velocity = flapStrength;
    }

    if (event.code === "KeyR" && gameOver) {
        restartGame(); 
        score = 0;
   scored = false;
    }

});
    

function gameLoop() {

if (gameOver) {
    drawGameOver();
    return;
}

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    velocity += gravity;
    birdY += velocity;
    pipeX -= pipeSpeed;
    if (!scored && pipeX + pipeWidth < birdX) {
    score++;
    scored = true;
    console.log("Score:", score);
}
    if (pipeX + pipeWidth < 0) {
    pipeX = canvas.width;
    pipeHeight = Math.floor(Math.random() * 250) + 100;
    scored = false;
}
    if (birdY + birdRadius >= groundY) {
    birdY = groundY - birdRadius;
    velocity = 0;
}

    drawBird();
    drawPipe();
    checkCollision();
    drawGround();
    drawScore();
    

    requestAnimationFrame(gameLoop);
}

gameLoop();