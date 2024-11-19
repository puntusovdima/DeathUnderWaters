// Get the canvas and its context for drawing the game elements
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Collision canvas for detecting pixel color for scoring
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

// Game variables
let score = 0;
let gameOver = false;
ctx.font = "50px impact";
let deadBodiesCounter = 0;

// Foe generation variables
let timeToNextFoe = 0;
let foeInterval = 500;
let lastTime = 0;
let foes = []; // Array to store Foe objects
const bulletHoleImages = ["bulletHole1.png", "bulletHole2.png"];
const hitSounds = ["hit2.mp3", "classic_hurt.mp3"];

// Foe class definition
class Foe {
  constructor() {
    // Initialize Foe properties
    this.spriteWidth = 56;
    this.spriteHeight = 66;
    this.sizeModifier = Math.random() * (1.5 - 0.5) + 0.5;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
    this.image = new Image();
    this.image.src = "bueno.png";
    this.image.onload = () => console.log("Image loaded");
    this.randomColors = [
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
    ];
    this.color =
      "rgb(" +
      this.randomColors[0] +
      "," +
      this.randomColors[1] +
      "," +
      this.randomColors[2] +
      ")";
    console.log(this.color);
  }

  // Update Foe position and animation
  update(deltaTime) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < -this.width) this.markedForDeletion = true;

    if (this.x < 0 - this.width) gameOver = true;
  }

  // Draw Foe on main canvas and colored squares on collision canvas
  draw() {
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      0,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

// Array to store deadBodies
let deadBodies = [];

// deadBodie class definition
class deadBodie {
  constructor(x, y, width, height) {
    // Initialize deadBodie properties
    this.image = new Image();
    this.image.src = "bueno_muerto.png";
    this.spriteWidth = 60;
    this.spriteHeight = 66;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.timeSinceLastFrame = 0;
    this.frameInterval = 500;
    deadBodiesCounter++;
    this.sound = new Audio();
    this.sound.src =
      deadBodiesCounter > 1 && deadBodiesCounter % 5 === 0
        ? hitSounds[1]
        : hitSounds[0];

    this.markedForDeletion = false;
  }

  // Update deadBodie animation
  update(deltaTime) {
    if (this.frame === 0) {
      this.sound.play();
    }
    this.timeSinceLastFrame += deltaTime;

    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 4) this.markedForDeletion = true;
    }
  }

  // Draw deadBodie on the main canvas
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
let bulletHoles = [];

// BulletHole class definition
class BulletHole {
  constructor(x, y, width, height) {
    this.image = new Image();
    this.image.src = bulletHoleImages[Math.random() > 0.5 ? 1 : 0];
    this.spriteWidth = 390;
    this.spriteHeight = 193;
    this.width = this.spriteWidth * 0.1;
    this.height = this.spriteHeight * 0.1;
    this.x = x;
    this.y = y;

    this.timeSinceLastFrame = 0;
    this.frameInterval = 200;
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    this.timeSinceLastFrame += deltaTime;
    if (deadBodiesCounter % 5 !== 0) {
      particles.push(new Particle(this.x - 10, this.y - 10, this.width));
    } //add particles to create smoke effect

    if (this.timeSinceLastFrame > this.frameInterval) {
      this.markedForDeletion = true;
    }
  }

  // Draw deadBodie on the main canvas
  draw() {
    ctx.drawImage(
      this.image,
      0,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

// Array to store particles
let particles = [];

// Particle class definition
class Particle {
  constructor(x, y, size) {
    // Initialize Particle properties
    this.size = size;
    this.x = x + this.size / 2 + Math.random() * 30 - 15;
    this.y = y + this.size / 3 + Math.random() * 30 - 15;
    this.radius = (Math.random() * this.size) / 10;
    this.maxRadius = Math.random() * 15 + 20; // Adjusted maxRadius calculation
    this.markedForDeletion = false;
    this.speedX = Math.random() * 1 + 0.5;
    this.color = "white";
  }

  // Update Particle position and size
  update() {
    this.x += this.speedX;
    this.radius += 0.5;
    if (this.radius > this.maxRadius - 5) {
      this.markedForDeletion = true;
    }
  }

  // Draw Particle on the main canvas
  draw() {
    ctx.save();
    ctx.globalAlpha = 1 - this.radius / this.maxRadius;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Function to draw the current score on the main canvas
function drawScore() {
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 50, 75);
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 55, 80);
}

// Function to draw the game over message on the main canvas
// Function to draw the game over message on the main canvas
function drawGameOver() {
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText(
    "GAME OVER, your score is " + score,
    canvas.width / 2,
    canvas.height / 2
  );
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillText(
    "GAME OVER, your score is " + score,
    canvas.width / 2 + 5,
    canvas.height / 2 + 5
  );
}

// Event listener for mouse click to detect pixel color and score
window.addEventListener("click", function (e) {
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  console.log(detectPixelColor);
  const pc = detectPixelColor.data;
  foes.forEach((object) => {
    if (
      object.randomColors[0] === pc[0] &&
      object.randomColors[1] === pc[1] &&
      object.randomColors[2] === pc[2]
    ) {
      object.markedForDeletion = true;
      score++;
      deadBodies.push(
        new deadBodie(object.x, object.y, object.width, object.height)
      );
      bulletHoles.push(
        new BulletHole(
          object.x + 20,
          object.y + 20,
          object.width,
          object.height
        )
      );
      console.log("Num of deadBodies:" + deadBodies.length);
      console.log("Num of bulletHoles:" + bulletHoles.length);
    }
  });
});

// Main animation loop
function animate(timestamp) {
  // Clear both canvases
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate time difference between frames
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // Update time and create new Foes at intervals
  timeToNextFoe += deltaTime;
  if (timeToNextFoe > foeInterval) {
    foes.push(new Foe());
    timeToNextFoe = 0;
    // Sort the foes based on width for layering effect
    foes.sort(function (a, b) {
      return a.width - b.width;
    });
  }

  // Draw the current score on the main canvas
  drawScore();

  // Update and draw all game elements (particles, foes, deadBodies)
  [...foes, ...deadBodies, ...particles, ...bulletHoles].forEach((object) =>
    object.update(deltaTime)
  );
  [...foes, ...deadBodies, ...particles, ...bulletHoles].forEach((object) =>
    object.draw()
  );

  // Remove objects marked for deletion
  foes = foes.filter((object) => !object.markedForDeletion);
  deadBodies = deadBodies.filter((object) => !object.markedForDeletion);
  bulletHoles = bulletHoles.filter((object) => !object.markedForDeletion);
  particles = particles.filter((particle) => !particle.markedForDeletion); // Added filter for particles

  // Continue the animation loop if the game is not over
  if (!gameOver) requestAnimationFrame(animate);
  else drawGameOver();
}

// Start the animation loop
animate(0);
