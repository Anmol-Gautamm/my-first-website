const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Bird properties
let birdX = 100;
let birdY = 200;
let birdRadius = 20;

// Gravity
let gravity = 0.5;
let velocity = 0;

function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(birdX, birdY, birdRadius, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply gravity
    velocity += gravity;
    birdY += velocity;

    // Draw bird
    drawBird();

    requestAnimationFrame(gameLoop);
}

gameLoop();