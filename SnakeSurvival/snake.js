let intervalId;
let poisonIntervalId;
let score = 0;

document.addEventListener("DOMContentLoaded", () => {
  const startGameButton = document.getElementById("startGame");
  if (startGameButton) {
    startGameButton.addEventListener("click", loadGamePage);
  }
});

// Function to start game play
function gamePlay() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const blockSize = 10;
  const widthInBlocks = width / blockSize;
  const heightInBlocks = height / blockSize;

  score = 0;
  const scoreElement = document.getElementById("score");
  if (scoreElement) {
    scoreElement.innerHTML = "Score: " + score;
  }

  const drawBorder = () => {
    ctx.fillStyle = "Gray";
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, height - blockSize, width, blockSize);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
  };

  function gameOver() {
    clearInterval(intervalId);
    clearInterval(poisonIntervalId);
    const restartButton = document.getElementById("restartButton");
    const playAgainButton = document.getElementById("playAgainButton");
    if (restartButton) restartButton.style.display = "none";
    if (playAgainButton) playAgainButton.style.display = "block";
    ctx.font = "60px Courier";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game Over", width / 2, height / 2);
    updateHighScore(score);
  }

  const circle = (x, y, radius, fillCircle) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  };

  class Block {
    constructor(col, row) {
      this.col = col;
      this.row = row;
    }
    drawSquare(color) {
      const x = this.col * blockSize;
      const y = this.row * blockSize;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, blockSize, blockSize);
    }
    drawCircle(color) {
      const centerX = this.col * blockSize + blockSize / 2;
      const centerY = this.row * blockSize + blockSize / 2;
      ctx.fillStyle = color;
      circle(centerX, centerY, blockSize / 2, true);
    }
    equal(otherBlock) {
      return this.col === otherBlock.col && this.row === otherBlock.row;
    }
  }

  class Snake {
    constructor() {
      this.segments = [new Block(7, 5), new Block(6, 5), new Block(5, 5)];
      this.direction = "right";
      this.nextDirection = "right";
    }
    draw() {
      for (let i = 0; i < this.segments.length; i++) {
        this.segments[i].drawSquare("Green");
      }
    }
    move() {
      const head = this.segments[0];
      let newHead;
      this.direction = this.nextDirection;
      if (this.direction === "right") {
        newHead = new Block(head.col + 1, head.row);
      } else if (this.direction === "down") {
        newHead = new Block(head.col, head.row + 1);
      } else if (this.direction === "left") {
        newHead = new Block(head.col - 1, head.row);
      } else if (this.direction === "up") {
        newHead = new Block(head.col, head.row - 1);
      }
      if (this.checkCollision(newHead)) {
        gameOver();
        return;
      }
      this.segments.unshift(newHead);
      if (newHead.equal(apple.position)) {
        score++;
        apple.move();
      } else if (newHead.equal(pApple.position) && score === 0) {
        gameOver();
      } else if (newHead.equal(pApple.position)) {
        score--;
        pApple.move();
      } else {
        this.segments.pop();
      }

      const scoreElement = document.getElementById("score");
      if (scoreElement) {
        scoreElement.innerHTML = "Score: " + score;
      }
    }
    checkCollision(head) {
      const leftCollision = head.col === 0;
      const topCollision = head.row === 0;
      const rightCollision = head.col === widthInBlocks - 1;
      const bottomCollision = head.row === heightInBlocks - 1;
      const wallCollision =
        leftCollision || topCollision || rightCollision || bottomCollision;
      let selfCollision = false;
      for (let i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
          selfCollision = true;
          break;
        }
      }
      return wallCollision || selfCollision;
    }
    setDirection(newDirection) {
      if (this.direction === "up" && newDirection === "down") {
        return;
      } else if (this.direction === "right" && newDirection === "left") {
        return;
      } else if (this.direction === "down" && newDirection === "up") {
        return;
      } else if (this.direction === "left" && newDirection === "right") {
        return;
      }
      this.nextDirection = newDirection;
    }
  }

  class Apple {
    constructor() {
      this.position = new Block(10, 10);
    }
    draw() {
      this.position.drawCircle("Red");
    }
    move() {
      const randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
      const randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
      this.position = new Block(randomCol, randomRow);
    }
  }

  class PoisonApple {
    constructor() {
      this.position = new Block(20, 20);
    }
    draw() {
      this.position.drawCircle("Black");
    }
    move() {
      let isConflict = true;
      let randomCol, randomRow;
      // Keep generating random positions until there's no conflict with snake segments
      while (isConflict) {
        randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
        randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
        const newPosition = new Block(randomCol, randomRow);
        isConflict = snake.segments.some((segment) =>
          segment.equal(newPosition)
        );
      }
      this.position = new Block(randomCol, randomRow);
    }
  }

  const snake = new Snake();
  const apple = new Apple();
  const pApple = new PoisonApple();

  intervalId = setInterval(() => {
    ctx.clearRect(0, 0, width, height);
    snake.move();
    snake.draw();
    apple.draw();
    pApple.draw();
    drawBorder();
  }, 100);

  poisonIntervalId = setInterval(() => {
    pApple.move();
  }, 5000);

  const directions = {
    ArrowLeft: "left",
    ArrowUp: "up",
    ArrowRight: "right",
    ArrowDown: "down",
  };

  document.body.addEventListener("keydown", (event) => {
    const newDirection = directions[event.key];
    if (newDirection !== undefined) {
      snake.setDirection(newDirection);
    }
  });

  // Retrieve high score
  const highScore = getHighScore();
  document.getElementById("highScore").textContent = "High Score: " + highScore;
}

// Function to save high score to local storage
function saveHighScore(score) {
  localStorage.setItem("highScore", score);
}

// Function to retrieve high score from local storage
function getHighScore() {
  return localStorage.getItem("highScore") || 0; // Default to 0 if no high score exists
}

// Update high score when a new high score is achieved
function updateHighScore(score) {
  const highScore = getHighScore();
  if (score > highScore) {
    saveHighScore(score);
    document.getElementById("highScore").textContent = "High Score: " + score;
  }
}

// Delete the high score
function deleteHighScore() {
    clearHighScore();
  }

document.body.addEventListener("keydown", (event) => {
  if (event.key === "Backspace") {
    clearHighScore();
  }
});

// Function to clear the high score from local storage
function clearHighScore() {
  localStorage.removeItem("highScore");
  document.getElementById("highScore").textContent = "High Score: 0";
}

function restart() {
  clearInterval(intervalId);
  clearInterval(poisonIntervalId);
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  score = 0;
  const scoreElement = document.getElementById("score");
  if (scoreElement) {
    scoreElement.innerHTML = "Score: " + score;
  }

  gamePlay();
}

function playAgain() {
  clearInterval(intervalId);
  clearInterval(poisonIntervalId);
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  score = 0;
  const scoreElement = document.getElementById("score");
  if (scoreElement) {
    scoreElement.innerHTML = "Score: " + score;
  }

  const restartButton = document.getElementById("restartButton");
  const playAgainButton = document.getElementById("playAgainButton");
  if (restartButton) restartButton.style.display = "block";
  if (playAgainButton) playAgainButton.style.display = "none";

  gamePlay();
}

function loadGamePage() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "snake.html", true);
  xhr.responseType = "text";
  xhr.onload = function () {
    if (xhr.status === 200) {
      const startPage = document.getElementById("changeMe");
      startPage.innerHTML = xhr.responseText;
      gamePlay();
      document
        .getElementById("homePage")
        .addEventListener("click", loadHomePage);
    }
  };
  xhr.send();
}

function loadHomePage() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "index.html", true);
  xhr.responseType = "text";
  xhr.onload = function () {
    if (xhr.status === 200) {
      const homePage = document.getElementById("changeMe");
      homePage.innerHTML = xhr.responseText;
      document
        .getElementById("startGame")
        .addEventListener("click", loadGamePage);
    }
  };
  xhr.send();
}
