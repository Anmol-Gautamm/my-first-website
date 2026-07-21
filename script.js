const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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

function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(birdX, birdY, birdRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawGround() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, groundY, canvas.width, groundHeight);
}

document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        velocity = flapStrength;
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    velocity += gravity;
    birdY += velocity;
    if (birdY + birdRadius >= groundY) {
    birdY = groundY - birdRadius;
    velocity = 0;
}

    drawBird();
    drawGround();

    requestAnimationFrame(gameLoop);
}

gameLoop();