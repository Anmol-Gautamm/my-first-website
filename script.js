// --- CANVAS & CONTEXT SETUP ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const soundToggleBtn = document.getElementById("soundToggle");
const pauseBtn = document.getElementById("pauseBtn");
const difficultyOverlay = document.getElementById("difficultyOverlay");
const diffBtns = document.querySelectorAll(".diff-btn");

// --- GAME STATES ---
const STATE_MENU = "MENU";
const STATE_PLAYING = "PLAYING";
const STATE_PAUSED = "PAUSED";
const STATE_GAMEOVER = "GAMEOVER";
let gameState = STATE_MENU;

// --- DIFFICULTY CONFIGURATION ---
const DIFFICULTY_CONFIG = {
    EASY: {
        name: "EASY",
        color: "#20e070",
        baseSpeed: 1.9,
        baseGap: 180,
        minGap: 155,
        gravity: 0.41,
        flapStrength: -7.2,
        movingPipeChance: 0, // No moving pipes
        movingAmplitude: 0
    },
    NORMAL: {
        name: "NORMAL",
        color: "#ffe600",
        baseSpeed: 2.4,
        baseGap: 160,
        minGap: 135,
        gravity: 0.45,
        flapStrength: -7.5,
        movingPipeChance: 0.35, // 35% chance after score 3
        movingAmplitude: 45
    },
    HARD: {
        name: "HARD",
        color: "#ff0055",
        baseSpeed: 2.9,
        baseGap: 140,
        minGap: 115,
        gravity: 0.48,
        flapStrength: -7.8,
        movingPipeChance: 0.70, // 70% chance after score 2
        movingAmplitude: 65
    }
};

let currentDifficulty = 'NORMAL';

function setDifficulty(diffKey) {
    if (!DIFFICULTY_CONFIG[diffKey]) return;
    currentDifficulty = diffKey;
    playSelectSound();
    diffBtns.forEach(btn => {
        if (btn.getAttribute("data-diff") === diffKey) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// --- AUDIO SYSTEM (Web Audio API) ---
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playFlapSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
    } catch (e) {}
}

function playScoreSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.type = 'triangle';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc2.frequency.setValueAtTime(659.25, now + 0.07); // E5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.12);
        osc2.start(now + 0.07);
        osc2.stop(now + 0.25);
    } catch (e) {}
}

function playHitSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    } catch (e) {}
}

function playPowerupSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    } catch (e) {}
}

function playShieldBreakSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    } catch (e) {}
}

function playSelectSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
    } catch (e) {}
}

// --- SCORES & PERSISTENCE ---
let score = 0;
let highScore = parseInt(localStorage.getItem("flappy_highscore") || "0", 10);
let isNewHighScore = false;

// --- BIRD PROPERTIES ---
const birdX = 110;
let birdY = 280;
const birdRadius = 17;
let velocity = 0;
let birdAngle = 0;
let wingFrame = 0;
let wingTimer = 0;

// --- POWER-UP ACTIVE TIMERS ---
let hasShield = false;
let slowMoTime = 0;
let doubleScoreTime = 0;

// --- PIPES SYSTEM ---
let pipes = [];
const pipeWidth = 72;
const pipeDistance = 220;

// --- ENVIRONMENT & SCROLLING ---
const groundHeight = 90;
const groundY = canvas.height - groundHeight;
let groundOffset = 0;
let cloudOffset = 0;
let cityOffset = 0;

// --- SCREEN SHAKE & PARTICLES ---
let shakeTime = 0;
let particles = [];

// --- CLOUD DATA ---
const clouds = [
    { x: 30, y: 50, scale: 0.9 },
    { x: 180, y: 90, scale: 1.2 },
    { x: 340, y: 40, scale: 0.8 },
    { x: 490, y: 75, scale: 1.1 }
];

// --- CITY SKYLINE DATA ---
const buildings = [
    { x: 0, w: 45, h: 75 },
    { x: 50, w: 40, h: 110 },
    { x: 95, w: 55, h: 65 },
    { x: 155, w: 35, h: 120 },
    { x: 195, w: 50, h: 85 },
    { x: 250, w: 40, h: 100 },
    { x: 295, w: 60, h: 80 },
    { x: 360, w: 45, h: 115 },
    { x: 410, w: 50, h: 90 }
];

// --- PARTICLE EMITTER ---
function createParticles(x, y, color, count = 8, speedScale = 1) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 3 + 1) * speedScale;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            color: color,
            alpha: 1,
            decay: Math.random() * 0.03 + 0.02
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// --- FLAP ACTION ---
function flap() {
    initAudio();
    const config = DIFFICULTY_CONFIG[currentDifficulty];

    if (gameState === STATE_MENU) {
        resetGame();
        gameState = STATE_PLAYING;
        velocity = config.flapStrength;
        playFlapSound();
        createParticles(birdX - 10, birdY + 5, "rgba(255, 255, 255, 0.8)", 6);
        return;
    }

    if (gameState === STATE_PLAYING) {
        velocity = config.flapStrength;
        playFlapSound();
        createParticles(birdX - 12, birdY + 8, "rgba(255, 255, 255, 0.7)", 5);
        return;
    }

    if (gameState === STATE_GAMEOVER) {
        resetGame();
        gameState = STATE_PLAYING;
        velocity = config.flapStrength;
        playFlapSound();
        return;
    }
}

// --- RESET GAME ---
function resetGame() {
    birdY = 280;
    velocity = 0;
    birdAngle = 0;
    score = 0;
    isNewHighScore = false;
    hasShield = false;
    slowMoTime = 0;
    doubleScoreTime = 0;
    shakeTime = 0;
    particles = [];
    pipes = [];
    spawnPipe(canvas.width + 100);
    spawnPipe(canvas.width + 100 + pipeDistance);
}

// --- PIPE MANAGEMENT & VERTICALLY MOVING PIPES ---
function spawnPipe(xPos) {
    const config = DIFFICULTY_CONFIG[currentDifficulty];
    const currentGap = Math.max(config.minGap, config.baseGap - Math.floor(score / 4) * 3);
    const minHeight = 65;
    const maxHeight = groundY - currentGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;

    const isMoving = (score >= 2 || currentDifficulty === 'HARD') && (Math.random() < config.movingPipeChance);
    const moveAmplitude = isMoving ? config.movingAmplitude : 0;
    const moveSpeed = isMoving ? (Math.random() * 0.03 + 0.025) : 0;

    let powerupType = null;
    if (Math.random() < 0.28) {
        const rand = Math.random();
        if (rand < 0.35) powerupType = 'shield';
        else if (rand < 0.70) powerupType = 'star';
        else powerupType = 'slow';
    }

    pipes.push({
        x: xPos,
        baseTopHeight: topHeight,
        topHeight: topHeight,
        currentGap: currentGap,
        
        bottomY: topHeight + currentGap,
        isMoving: isMoving,
        moveAmplitude: moveAmplitude,
        moveSpeed: moveSpeed,
        movePhase: Math.random() * Math.PI * 2,
        passed: false,
        powerup: powerupType ? {
            type: powerupType,
            y: topHeight + currentGap / 2,
            collected: false,
            floatOffset: 0
        } : null
    });
}

function updatePipes() {
    const config = DIFFICULTY_CONFIG[currentDifficulty];
    const speedMult = slowMoTime > 0 ? 0.6 : 1.0;
    const currentSpeed = (config.baseSpeed + Math.min(2.0, score * 0.04)) * speedMult;

    for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= currentSpeed;

        if (p.isMoving) {
            p.movePhase += p.moveSpeed * (slowMoTime > 0 ? 0.6 : 1.0);
            const yOffset = Math.sin(p.movePhase) * p.moveAmplitude;
            p.topHeight = Math.max(50, Math.min(groundY - p.currentGap - 50, p.baseTopHeight + yOffset));
            p.bottomY = p.topHeight + p.currentGap;
        }

        if (p.powerup && !p.powerup.collected) {
            p.powerup.floatOffset += 0.05;
            p.powerup.y = p.topHeight + p.currentGap / 2;
        }

        if (!p.passed && p.x + pipeWidth < birdX) {
            p.passed = true;
            const pointsGained = doubleScoreTime > 0 ? 2 : 1;
            score += pointsGained;

            if (score > highScore) {
                highScore = score;
                isNewHighScore = true;
                localStorage.setItem("flappy_highscore", highScore.toString());
            }

            playScoreSound();
            createParticles(birdX + 20, birdY, "#ffe600", 12, 1.2);
        }

        if (checkPipeCollision(p)) {
            if (hasShield) {
                hasShield = false;
                shakeTime = 15;
                playShieldBreakSound();
                createParticles(birdX, birdY, "#00f0ff", 20, 2);
                p.passed = true;
            } else {
                triggerGameOver();
                return;
            }
        }

        if (p.powerup && !p.powerup.collected) {
            const powX = p.x + pipeWidth / 2;
            const powY = p.powerup.y + Math.sin(p.powerup.floatOffset) * 8;
            const dist = Math.hypot(birdX - powX, birdY - powY);

            if (dist < birdRadius + 15) {
                p.powerup.collected = true;
                playPowerupSound();

                if (p.powerup.type === 'shield') {
                    hasShield = true;
                    createParticles(powX, powY, "#00f0ff", 15);
                } else if (p.powerup.type === 'star') {
                    doubleScoreTime = 400;
                    createParticles(powX, powY, "#ffe600", 15);
                } else if (p.powerup.type === 'slow') {
                    slowMoTime = 300;
                    createParticles(powX, powY, "#a855f7", 15);
                }
            }
        }

        if (p.x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }

    const lastPipe = pipes[pipes.length - 1];
    if (!lastPipe || lastPipe.x <= canvas.width - pipeDistance) {
        spawnPipe(canvas.width);
    }
}

function checkPipeCollision(p) {
    if (birdX + birdRadius > p.x && birdX - birdRadius < p.x + pipeWidth) {
        if (birdY - birdRadius < p.topHeight || birdY + birdRadius > p.bottomY) {
            return true;
        }
    }
    return false;
}

function triggerGameOver() {
    shakeTime = 20;
    playHitSound();
    createParticles(birdX, birdY, "#ff0055", 25, 2.5);
    gameState = STATE_GAMEOVER;
}

// --- RENDERING FUNCTIONS ---

function drawBackgroundSky() {
    const timeShift = Math.min(1, score / 40);
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    
    const r1 = Math.round(112 * (1 - timeShift) + 245 * timeShift);
    const g1 = Math.round(197 * (1 - timeShift) + 120 * timeShift);
    const b1 = Math.round(206 * (1 - timeShift) + 130 * timeShift);
    
    grad.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
    grad.addColorStop(1, "#cce7ee");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(100, 140, 160, 0.35)";
    buildings.forEach(b => {
        const bx = (b.x - cityOffset * 0.4) % (canvas.width + 100);
        const actualX = bx < -60 ? bx + canvas.width + 100 : bx;
        ctx.fillRect(actualX, groundY - b.h, b.w, b.h);
    });

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    clouds.forEach(c => {
        const cx = (c.x - cloudOffset * 0.5) % (canvas.width + 120);
        const actualX = cx < -80 ? cx + canvas.width + 120 : cx;
        drawSingleCloud(actualX, c.y, c.scale);
    });
}

function drawSingleCloud(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.arc(15, -8, 14, 0, Math.PI * 2);
    ctx.arc(30, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawGround() {
    ctx.fillStyle = "#20e070";
    ctx.fillRect(0, groundY, canvas.width, 16);

    const dirtGrad = ctx.createLinearGradient(0, groundY + 16, 0, canvas.height);
    dirtGrad.addColorStop(0, "#d2b48c");
    dirtGrad.addColorStop(1, "#8b5a2b");
    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, groundY + 16, canvas.width, groundHeight - 16);

    ctx.strokeStyle = "#15a048";
    ctx.lineWidth = 3;
    for (let x = -groundOffset; x < canvas.width + 30; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + 12, groundY + 16);
        ctx.stroke();
    }
}

function drawPipes() {
    pipes.forEach(p => {
        const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + pipeWidth, 0);
        if (p.isMoving) {
            pipeGrad.addColorStop(0, "#ff0055");
            pipeGrad.addColorStop(0.3, "#ff5588");
            pipeGrad.addColorStop(0.7, "#d40040");
            pipeGrad.addColorStop(1, "#880028");
        } else {
            pipeGrad.addColorStop(0, "#2ee052");
            pipeGrad.addColorStop(0.3, "#78f090");
            pipeGrad.addColorStop(0.7, "#1bb83a");
            pipeGrad.addColorStop(1, "#0d7022");
        }

        ctx.fillStyle = pipeGrad;
        ctx.strokeStyle = p.isMoving ? "#550015" : "#084814";
        ctx.lineWidth = 3;

        ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
        ctx.strokeRect(p.x, 0, pipeWidth, p.topHeight);

        ctx.fillRect(p.x - 5, p.topHeight - 24, pipeWidth + 10, 24);
        ctx.strokeRect(p.x - 5, p.topHeight - 24, pipeWidth + 10, 24);

        const bottomHeight = groundY - p.bottomY;
        ctx.fillRect(p.x, p.bottomY, pipeWidth, bottomHeight);
        ctx.strokeRect(p.x, p.bottomY, pipeWidth, bottomHeight);

        ctx.fillRect(p.x - 5, p.bottomY, pipeWidth + 10, 24);
        ctx.strokeRect(p.x - 5, p.bottomY, pipeWidth + 10, 24);

        if (p.isMoving) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("↕️", p.x + pipeWidth / 2, p.topHeight - 30);
            ctx.fillText("↕️", p.x + pipeWidth / 2, p.bottomY + 40);
        }

        if (p.powerup && !p.powerup.collected) {
            const powX = p.x + pipeWidth / 2;
            const powY = p.powerup.y + Math.sin(p.powerup.floatOffset) * 8;
            drawPowerupItem(powX, powY, p.powerup.type);
        }
    });
}

function drawPowerupItem(x, y, type) {
    ctx.save();
    ctx.translate(x, y);

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    if (type === 'shield') ctx.fillStyle = "rgba(0, 240, 255, 0.4)";
    else if (type === 'star') ctx.fillStyle = "rgba(255, 230, 0, 0.4)";
    else ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let icon = "🛡️";
    if (type === 'star') icon = "⭐";
    if (type === 'slow') icon = "⏳";
    ctx.fillText(icon, 0, 1);

    ctx.restore();
}

function drawBird() {
    ctx.save();
    ctx.translate(birdX, birdY);

    birdAngle = Math.max(-0.4, Math.min(1.2, velocity * 0.08));
    ctx.rotate(birdAngle);

    if (hasShield) {
        ctx.beginPath();
        ctx.arc(0, 0, birdRadius + 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 240, 255, 0.35)";
        ctx.fill();
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    const birdGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, birdRadius);
    birdGrad.addColorStop(0, "#fff066");
    birdGrad.addColorStop(0.7, "#ffd700");
    birdGrad.addColorStop(1, "#e69d00");

    ctx.fillStyle = birdGrad;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(0, 0, birdRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const wingY = Math.sin(wingFrame) * 6;
    ctx.fillStyle = "#ffae00";
    ctx.beginPath();
    ctx.ellipse(-6, wingY, 8, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e69d00";
    ctx.beginPath();
    ctx.moveTo(-birdRadius, 0);
    ctx.lineTo(-birdRadius - 8, -6);
    ctx.lineTo(-birdRadius - 8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(6, -5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(8, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(7, -7, 1, 0, Math.PI * 2);
    ctx.fill();

    const beakGrad = ctx.createLinearGradient(birdRadius - 2, 0, birdRadius + 12, 0);
    beakGrad.addColorStop(0, "#ff7700");
    beakGrad.addColorStop(1, "#ff3300");

    ctx.fillStyle = beakGrad;
    ctx.beginPath();
    ctx.moveTo(birdRadius - 2, -3);
    ctx.lineTo(birdRadius + 11, 1);
    ctx.lineTo(birdRadius - 2, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function drawHUD() {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;
    ctx.font = "800 38px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText(score.toString(), canvas.width / 2, 55);
    ctx.fillText(score.toString(), canvas.width / 2, 55);

    const diff = DIFFICULTY_CONFIG[currentDifficulty];
    ctx.save();
    ctx.font = "700 13px 'Press Start 2P', cursive";
    ctx.textAlign = "left";
    ctx.fillStyle = diff.color;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeText(diff.name, 20, 40);
    ctx.fillText(diff.name, 20, 40);
    ctx.restore();

    let badgeY = 70;
    if (doubleScoreTime > 0) {
        drawHUDPowerupBadge(20, badgeY, "⭐ 2X Points", "#ffe600");
        badgeY += 28;
    }
    if (slowMoTime > 0) {
        drawHUDPowerupBadge(20, badgeY, "⏳ Slow-Mo", "#a855f7");
        badgeY += 28;
    }
    if (hasShield) {
        drawHUDPowerupBadge(20, badgeY, "🛡️ Shield Active", "#00f0ff");
    }
}

function drawHUDPowerupBadge(x, y, text, color) {
    ctx.save();
    ctx.font = "600 13px 'Outfit', sans-serif";
    ctx.textAlign = "left";

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.beginPath();
    ctx.roundRect(x, y, 120, 22, 11);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.fillText(text, x + 10, y + 15);
    ctx.restore();
}

function drawMenuScreen() {
    const hoverY = Math.sin(Date.now() * 0.003) * 8;

    ctx.save();
    ctx.textAlign = "center";

    ctx.fillStyle = "#ffe600";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.font = "700 36px 'Press Start 2P', cursive";
    ctx.strokeText("FLAPPY", canvas.width / 2, 170 + hoverY);
    ctx.fillText("FLAPPY", canvas.width / 2, 170 + hoverY);

    ctx.font = "700 30px 'Press Start 2P', cursive";
    ctx.strokeText("BIRD", canvas.width / 2, 220 + hoverY);
    ctx.fillText("BIRD", canvas.width / 2, 220 + hoverY);

    const alphaPulse = 0.5 + Math.sin(Date.now() * 0.006) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${alphaPulse})`;
    ctx.font = "600 18px 'Outfit', sans-serif";
    ctx.fillText("TAP OR PRESS SPACE TO PLAY", canvas.width / 2, 340);

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 16px 'Outfit', sans-serif";
    ctx.fillText(`🏆 BEST SCORE: ${highScore}`, canvas.width / 2, 400);

    ctx.restore();
}

function drawPauseScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffe600";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;
    ctx.font = "700 32px 'Press Start 2P', cursive";
    ctx.strokeText("PAUSED", canvas.width / 2, 300);
    ctx.fillText("PAUSED", canvas.width / 2, 300);

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 18px 'Outfit', sans-serif";
    ctx.fillText("Press P or Tap Pause to Resume", canvas.width / 2, 360);
    ctx.restore();
}

function drawGameOverScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cardW = 340;
    const cardH = 290;
    const cardX = (canvas.width - cardW) / 2;
    const cardY = (canvas.height - cardH) / 2 - 10;

    ctx.save();

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 20);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.textAlign = "center";
    ctx.fillStyle = "#ff0055";
    ctx.font = "700 24px 'Press Start 2P', cursive";
    ctx.fillText("GAME OVER", canvas.width / 2, cardY + 45);

    let medalEmoji = "🥉";
    if (score >= 50) { medalEmoji = "💎"; }
    else if (score >= 30) { medalEmoji = "🥇"; }
    else if (score >= 15) { medalEmoji = "🥈"; }

    ctx.fillStyle = "#f1f5f9";
    ctx.beginPath();
    ctx.arc(cardX + 65, cardY + 135, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "28px sans-serif";
    ctx.fillText(medalEmoji, cardX + 65, cardY + 144);

    ctx.textAlign = "left";
    ctx.fillStyle = "#64748b";
    ctx.font = "600 14px 'Outfit', sans-serif";
    ctx.fillText("SCORE", cardX + 120, cardY + 115);
    ctx.fillText("BEST SCORE", cardX + 120, cardY + 155);

    ctx.fillStyle = "#0f172a";
    ctx.font = "800 22px 'Outfit', sans-serif";
    ctx.fillText(score.toString(), cardX + 220, cardY + 117);
    ctx.fillText(highScore.toString(), cardX + 220, cardY + 157);

    if (isNewHighScore) {
        ctx.fillStyle = "#ff0055";
        ctx.font = "800 12px 'Outfit', sans-serif";
        ctx.fillText("NEW BEST!", cardX + 120, cardY + 180);
    }

    const pulse = 0.5 + Math.sin(Date.now() * 0.008) * 0.5;
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(15, 23, 42, ${pulse})`;
    ctx.font = "700 16px 'Outfit', sans-serif";
    ctx.fillText("Tap or Press R to Restart", canvas.width / 2, cardY + 240);

    ctx.restore();
}

// --- MAIN GAME LOOP ---
function gameLoop() {
    // Show/Hide HTML Difficulty Selector overlay based on game state
    if (gameState === STATE_MENU) {
        difficultyOverlay.classList.remove("hidden");
    } else {
        difficultyOverlay.classList.add("hidden");
    }

    ctx.save();
    if (shakeTime > 0) {
        const shakeX = (Math.random() - 0.5) * shakeTime;
        const shakeY = (Math.random() - 0.5) * shakeTime;
        ctx.translate(shakeX, shakeY);
        shakeTime--;
    }

    const config = DIFFICULTY_CONFIG[currentDifficulty];
    const speedMult = slowMoTime > 0 ? 0.6 : 1.0;
    const currentSpeed = (config.baseSpeed + Math.min(2.0, score * 0.04)) * speedMult;

    if (gameState === STATE_PLAYING) {
        groundOffset = (groundOffset + currentSpeed) % 24;
        cloudOffset += 0.4 * speedMult;
        cityOffset += 0.2 * speedMult;

        if (slowMoTime > 0) slowMoTime--;
        if (doubleScoreTime > 0) doubleScoreTime--;

        velocity += config.gravity;
        birdY += velocity;

        wingTimer += 0.2;
        wingFrame = wingTimer;

        if (birdY + birdRadius >= groundY) {
            birdY = groundY - birdRadius;
            triggerGameOver();
        }

        if (birdY - birdRadius <= 0) {
            birdY = birdRadius;
            velocity = 0;
        }

        updatePipes();
        updateParticles();
    }

    drawBackgroundSky();
    drawPipes();
    drawGround();
    drawParticles();

    if (gameState === STATE_MENU) {
        drawBird();
        drawMenuScreen();
    } else if (gameState === STATE_PLAYING) {
        drawBird();
        drawHUD();
    } else if (gameState === STATE_PAUSED) {
        drawBird();
        drawHUD();
        drawPauseScreen();
    } else if (gameState === STATE_GAMEOVER) {
        drawBird();
        drawGameOverScreen();
    }

    ctx.restore();
    requestAnimationFrame(gameLoop);
}

// --- INPUT & EVENT LISTENERS ---

// Attach Difficulty Button Listeners
diffBtns.forEach(btn => {
    btn.addEventListener("click", function(e) {
        e.stopPropagation();
        const diff = this.getAttribute("data-diff");
        setDifficulty(diff);
    });
    btn.addEventListener("touchstart", function(e) {
        e.stopPropagation();
        const diff = this.getAttribute("data-diff");
        setDifficulty(diff);
    }, { passive: true });
});

function handlePointer(e) {
    if (e.target === soundToggleBtn || e.target === pauseBtn) return;
    if (e.target.classList.contains("diff-btn")) return;
    flap();
}

window.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        flap();
    }

    if (gameState === STATE_MENU) {
        if (e.code === "Digit1" || e.code === "Numpad1") { setDifficulty('EASY'); }
        if (e.code === "Digit2" || e.code === "Numpad2") { setDifficulty('NORMAL'); }
        if (e.code === "Digit3" || e.code === "Numpad3") { setDifficulty('HARD'); }
    }

    if (e.code === "KeyP") {
        if (gameState === STATE_PLAYING) gameState = STATE_PAUSED;
        else if (gameState === STATE_PAUSED) gameState = STATE_PLAYING;
    }

    if (e.code === "KeyR") {
        if (gameState === STATE_GAMEOVER || gameState === STATE_PAUSED) {
            resetGame();
            gameState = STATE_PLAYING;
        }
    }

    if (e.code === "KeyM") {
        toggleSound();
    }
});

canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    handlePointer(e);
}, { passive: false });

canvas.addEventListener("mousedown", function (e) {
    handlePointer(e);
});

function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggleBtn.innerText = soundEnabled ? "🔊" : "🔇";
}

soundToggleBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleSound();
});

pauseBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (gameState === STATE_PLAYING) gameState = STATE_PAUSED;
    else if (gameState === STATE_PAUSED) gameState = STATE_PLAYING;
});

// --- INITIALIZE & START LOOP ---
resetGame();
gameState = STATE_MENU;
requestAnimationFrame(gameLoop);