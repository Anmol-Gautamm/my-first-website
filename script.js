const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//score 
let highScore = 0;
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
    ctx.save();

    // Rotate bird based on movement
    ctx.translate(birdX, birdY);

    if (velocity < 0) {
        ctx.rotate(-0.3);
    } else {
        ctx.rotate(0.3);
    }

    // Body
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(0, 0, birdRadius, 0, Math.PI * 2);
    ctx.fill();
ctx.strokeStyle = "black";
ctx.lineWidth = 2;
ctx.stroke();
    // Wing
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.ellipse(-5, 3, 8, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    // Eye
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(6, -5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(7, -5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.moveTo(birdRadius, 0);
    ctx.lineTo(birdRadius + 12, -4);
    ctx.lineTo(birdRadius + 12, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
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
ctx.fillText("Best: " + highScore, 20, 80);
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
    ctx.fillStyle = "#228B22";

    // Top pipe
    ctx.fillRect(pipeX, 0, pipeWidth, pipeHeight);

    // Top pipe cap
    ctx.fillRect(
        pipeX - 5,
        pipeHeight - 20,
        pipeWidth + 10,
        20
    );

    // Bottom pipe
    ctx.fillRect(
        pipeX,
        pipeHeight + pipeGap,
        pipeWidth,
        canvas.height - (pipeHeight + pipeGap) - groundHeight
    );

    // Bottom pipe cap
    ctx.fillRect(
        pipeX - 5,
        pipeHeight + pipeGap,
        pipeWidth + 10,
        20
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

    score = 0;
    scored = false;

    gameOver = false;
}

function drawBackground() {
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

    gameLoop();


document.addEventListener("keydown", function (event) { 

    if (event.code === "Space") {
        velocity = flapStrength;
    }

  if (event.code === "KeyR" && gameOver) {
    restartGame();
    requestAnimationFrame(gameLoop);

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

    drawBackground();

    velocity += gravity;
    birdY += velocity;
    pipeX -= pipeSpeed;
    if (!scored && pipeX + pipeWidth < birdX) {
    score++;
    if (score > highScore) {
    highScore = score;
}
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