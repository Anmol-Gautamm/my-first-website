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
let cloudX = 0;
let groundOffset = 0;

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
  let wingY = velocity < 0 ? -2 : 4;

ctx.fillStyle = "#FFD700";
ctx.beginPath();
ctx.ellipse(-5, wingY, 8, 5, -0.4, 0, Math.PI * 2);
ctx.fill();
    ctx.fillStyle = "#FFD700";
ctx.beginPath();
ctx.moveTo(-birdRadius, -2);
ctx.lineTo(-birdRadius - 10, -8);
ctx.lineTo(-birdRadius - 10, 4);
ctx.closePath();
ctx.fill();
    // Eye
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(6, -5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(8, -5, 1.5, 0, Math.PI * 2);
    ctx.fill();
ctx.fillStyle = "white";
ctx.beginPath();
ctx.arc(7.3, -5.8, 0.6, 0, Math.PI * 2);
ctx.fill();
    // Beak
   ctx.fillStyle = "#FF8C00";
   ctx.strokeStyle = "#B85C00";
ctx.lineWidth = 1;
ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(birdRadius, 0);
    ctx.lineTo(birdRadius + 12, -4);
    ctx.lineTo(birdRadius + 12, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawCloud(x, y) {
    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 10, 18, 0, Math.PI * 2);
    ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
    ctx.fill();
}

function drawGround() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, groundY, canvas.width, groundHeight);

    ctx.strokeStyle = "#145214";
    ctx.lineWidth = 2;

    for (let i = -groundOffset; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, groundY);
        ctx.lineTo(i + 15, groundY + 15);
        ctx.stroke();
    }
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
  drawCloud(80 + cloudX, 80);
drawCloud(280 + cloudX, 140);
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
    ctx.shadowColor = "black";
ctx.shadowBlur = 8;
ctx.shadowOffsetX = 2;
ctx.shadowOffsetY = 2;
    return;
}

    ctx.clearRect(0, 0, canvas.width, canvas.height);



    drawBackground();

    velocity += gravity;
    birdY += velocity;
    pipeX -= pipeSpeed;
    groundOffset += 2;

if (groundOffset >= 30) {
    groundOffset = 0;
}
    cloudX -= 0.3;

if (cloudX < -400) {
    cloudX = 0;
}
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