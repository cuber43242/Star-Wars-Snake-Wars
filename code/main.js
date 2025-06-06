import kaboom from "kaboom";

const k = kaboom({
  background: [0, 0, 0], // Dark space theme
  global: true,
  width: 800,
  height: 600,
});

// Load Star Wars-themed sprites
loadSprite("starship", "sprites/starship.png");
loadSprite("lightsaber", "sprites/lightsaber.png");
loadSprite("deathStar", "sprites/death_star.png");

let highScore = 0; // Keep track of the high score in memory

// Create a title screen with Star Wars theme
scene("instructions", () => {
  add([
    text("STAR WARS: SNAKE WARS", { size: 48 }),
    pos(width() / 2, height() / 4),
    origin("center"),
    color(255, 255, 0),
  ]);

  add([
    text("How to Play:", { size: 32 }),
    pos(width() / 2, height() / 2 - 50),
    origin("center"),
    color(255, 255, 255),
  ]);

  add([
    text("- You are the jedi as an aqua snake\n-Immobilize sith weaponary\n- Use arrow keys to control the jedi snake\n- Collect sith lightsabers to grow\n- Avoid walls and yourself (you will die with yourself)\n- Score increases with each lightsaber\n- Try to achieve a high score to win",
      { size: 24 }),
    pos(width() / 2, height() / 2 + 50),
    origin("center"),
  ]);

  add([
    sprite("starship"),
    pos(width() / 2, height() / 2 + 150),
    origin("center"),
    scale(0.5),
  ]);

  add([
    text("Press SPACE to Start", { size: 32 }),
    pos(width() / 2, height() - 100),
    origin("center"),
    color(0, 255, 0),
  ]);

  keyPress("space", () => {
    go("game");
  });
});

scene("game", () => {
  const BLOCK_SIZE = 25; // Block size
  let SNAKE_SPEED = 5;
  let score = 0;

  let snake = [];
  let direction = "right";
  let gameOver = false;
  let food = null;

  const level = addLevel([
    "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", // Top border
    "r                              r", // Left and right borders
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    "r                              r",
    // Add more rows if desired
    "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", // Bottom border
  ], {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    "r": () => [
      rect(BLOCK_SIZE, BLOCK_SIZE),
      color(255, 0, 0),
      area(),
      "wall",
    ],
  });

  const scoreLabel = add([
    text("Score: 0", { size: 24 }),
    pos(24, 24),
    color(255, 255, 255),
  ]);

  const highScoreLabel = add([
    text(`High Score: ${highScore}`, { size: 24 }),
    pos(24, 50),
    color(255, 255, 0),
  ]);

  function initSnake() {
    snake = [];
    direction = "right";
    gameOver = false;
    score = 0;
    SNAKE_SPEED = 0.2;

    for (let i = 0; i < 3; i++) {
      snake.push(add([
        rect(BLOCK_SIZE - 2, BLOCK_SIZE - 2),
        pos(BLOCK_SIZE * (3 - i), BLOCK_SIZE * 3),
        color(0, 255, 255),
        area(),
        "snake",
      ]));
    }
  }

  function spawnFood() {
    if (food) {
      destroy(food);
    }
    const randomX = Math.floor(Math.random() * 28) + 1;
    const randomY = Math.floor(Math.random() * 18) + 1;
    food = add([
      sprite("lightsaber"),
      pos(BLOCK_SIZE * randomX, BLOCK_SIZE * randomY),
      area(),
      scale(0.4),
      "food",
    ]);
  }

  action(() => {
    // Handle input for movement
    if (keyIsDown("up") && direction !== "down") {
      direction = "up";
    }
    if (keyIsDown("down") && direction !== "up") {
      direction = "down";
    }
    if (keyIsDown("left") && direction !== "right") {
      direction = "left";
    }
    if (keyIsDown("right") && direction !== "left") {
      direction = "right";
    }
  });

  let moveTimer = 0;
  action(() => {
    if (gameOver) return;

    moveTimer += dt();
    if (moveTimer < SNAKE_SPEED) return;
    moveTimer = 0;

    const head = snake[0];
    let newX = head.pos.x;
    let newY = head.pos.y;

    switch (direction) {
      case "up": newY -= BLOCK_SIZE; break;
      case "down": newY += BLOCK_SIZE; break;
      case "left": newX -= BLOCK_SIZE; break;
      case "right": newX += BLOCK_SIZE; break;
    }

    const newHead = add([
      rect(BLOCK_SIZE - 2, BLOCK_SIZE - 2),
      pos(newX, newY),
      color(0, 255, 255),
      area(),
      "snake",
    ]);

    snake.unshift(newHead);

    // Check for collisions with food
    if (newHead.isColliding(food)) {
      score += 10;
      scoreLabel.text = `Score: ${score}`;
      if (score > highScore) {
        highScore = score; // Update the high score variable
        highScoreLabel.text = `High Score: ${highScore}`; // Update displayed high score
      }
      spawnFood();
    } else {
      const tail = snake.pop();
      destroy(tail);
    }

    // Check for collisions with walls or itself
    if (newHead.isColliding("wall") ||
      snake.slice(1).some(segment => newHead.isColliding(segment))) {
      gameOver = true;
      shake(12);
      wait(1, () => {
        go("lose", score, highScore); // Pass score and high score to lose scene
      });
    }
  });

  initSnake();
  spawnFood();
});

// Scene for game over
scene("lose", (finalScore, finalHighScore) => {
  add([
    text("Game Over", { size: 48 }),
    pos(width() / 2, height() / 2 - 50),
    origin("center"),
  ]);

  add([
    text(`Score: ${finalScore}`, { size: 24 }),
    pos(width() / 2, height() / 2),
    origin("center"),
  ]);

  add([
    text(`High Score: ${finalHighScore}`, { size: 24 }),
    pos(width() / 2, height() / 2 + 30),
    origin("center"),
    color(255, 255, 0),
  ]);

  add([
    text("Press SPACE to Restart", { size: 24 }),
    pos(width() / 2, height() / 2 + 70),
    origin("center"),
  ]);

  keyPress("space", () => {
    go("game"); // Restart the game
  });
});

// Start game at the instructions scene
go("instructions");

