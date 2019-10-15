const DEFAULT_NAME = 'Guest';

var intervalId = undefined;
var pIntervalId = undefined;

function getUser() {
    return localStorage.getItem('user') || DEFAULT_NAME;
}

function setUser(name = getUser()) {
    if (!name) {
        name = DEFAULT_NAME;
    }
    console.log({name});

    localStorage.setItem('user', name);
    return name; 
}

// Player Default name.
var input = setUser();
console.log(input);

let startGame_btn = document.getElementById('startGame');
startGame_btn.addEventListener('click', function () {
    gamePage();
});

// function to start the actual game
function gamePlay() {
    // Setting up the canvas
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    // Get the width and the height from the canvas element
    var width = canvas.width;
    var height = canvas.height;

    //Work out the width and height in blocks
    var blockSize = 10;
    var widthInBlocks = width / blockSize;
    var heightInBlocks = height / blockSize;

    // set score to 0
    var score = 0;
    document.getElementById("score").innerHTML = "Score: " + score;

    /* let highscore = 0;

    if (score > localStorage.getItem("highscore")) {

        localStorage.setItem("highscore", score);
        highscore.push(highscore);
        console.log("highscore[] ", highscore);
    }
    document.getElementById("highscore").innerHTML = localStorage.getItem("highscore"); */

    // Draw the boarder
    var drawBoarder = function () {
        ctx.fillStyle = "Red";
        ctx.fillRect(0, 0, width, blockSize);
        ctx.fillRect(0, height - blockSize, width, blockSize);
        ctx.fillRect(0, 0, blockSize, height);
        ctx.fillRect(width - blockSize, 0, blockSize, height);
    };

    // Draw the score in the top-left corner

    var drawScore = function () {
        ctx.font = "20px Courier";
        ctx.fillStyle = "Black";
        ctx.textAlign = "left";
        ctx.textBaseLine = "top";
        ctx.fillText("Score: " + score, blockSize, blockSize);
    };

    // Clear the interval and display Game Over text
    var gameOver = function () {
        clearInterval(intervalId);
        clearInterval(pIntervalId);
        ctx.font = "60px Courier";
        ctx.fillStyle = "Black";
        ctx.textAlign = "center";
        ctx.textBaseLine = "middle";
        ctx.fillText("Game Over", width / 2, height / 2);
    };

    //Draw a circle 
    var circle = function (x, y, radius, fillCircle) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        if (fillCircle) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
    };

    // The Block constructor
    var Block = function (col, row) {
        this.col = col;
        this.row = row;
    };

    // Draw a square at the block's location
    Block.prototype.drawSquare = function (color) {
        var x = this.col * blockSize;
        var y = this.row * blockSize;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, blockSize, blockSize);
    };

    //Draw a circle at the block's location
    Block.prototype.drawCircle = function (color) {
        var centerX = this.col * blockSize + blockSize / 2;
        var centerY = this.row * blockSize + blockSize / 2;
        ctx.fillStyle = color;
        circle(centerX, centerY, blockSize / 2, true);
    };

    // Check if this block is in the same location as another block
    Block.prototype.equal = function (otherBlock) {
        return this.col === otherBlock.col && this.row === otherBlock.row;
    };

    // The Snack constructor
    var Snake = function () {
        this.segments = [
            new Block(7, 5),
            new Block(6, 5),
            new Block(5, 5)
        ];
        this.direction = "right";
        this.nextDirection = "right";
    };

    // Draw a square for each segment of the snake's body
    Snake.prototype.draw = function () {
        for (var i = 0; i < this.segments.length; i++) {
            this.segments[i].drawSquare("Green");
        }
    };

    // Create a new head and add it to the beginning of the snake
    Snake.prototype.move = function () {

        var head = this.segments[0];
        var newHead;

        this.direction = this.nextDirection;
        if (this.direction === "right") {
            newHead = new Block(head.col + 1, head.row);
            // document.getElementById("msg").innerHTML = "";
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
            console.log(score);
            apple.move();
        }
        else if (newHead.equal(pApple.position) && score === 0) {
            gameOver();
        }
        else if (newHead.equal(pApple.position)) {
            score--;
            pApple.move();
        }
        else {
            this.segments.pop();
        }
        document.getElementById("score").innerHTML = "Score: " + score;
    };

    //Check if the snake's new head has collided with the wall or itself
    Snake.prototype.checkCollision = function (head) {
        var leftCollision = (head.col === 0);
        var topCollision = (head.row === 0);
        var rightCollision = (head.col === widthInBlocks - 1);
        var bottonCollision = (head.row === heightInBlocks - 1);

        var wallCollision = leftCollision || topCollision || rightCollision || bottonCollision;

        var selfCollision = false;

        for (var i = 0; i < this.segments.length; i++) {
            if (head.equal(this.segments[i])) {
                selfCollision = true;
            }
        }
        return wallCollision || selfCollision;
    };

    // Set the snake's next direction based on keyboard
    Snake.prototype.setDirection = function (newDirection) {
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
    };

    // The Apple constructor
    var Apple = function () {
        this.position = new Block(10, 10);
    };

    // Draw a circle at the apple's location 
    Apple.prototype.draw = function () {
        this.position.drawCircle("Red");
    };

    // Move the apple to a new random location
    Apple.prototype.move = function () {
        var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
        var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
        this.position = new Block(randomCol, randomRow);
    };

    var PApple = function () {
        this.position = new Block(20, 20);
    };
    //Poison Apple
    PApple.prototype.draw = function () {
        this.position.drawCircle("Black");
    };

    //Poison Apple
    PApple.prototype.move = function () {
        var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
        var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
        this.position = new Block(randomCol, randomRow);
    };

    // Create the snake and apple objects
    var snake = new Snake();
    var apple = new Apple();
    var pApple = new PApple();

    // pass an animation function to setInterval
    intervalId = setInterval(function () {
        ctx.clearRect(0, 0, width, height);
        /* drawScore(); */
        snake.move();
        snake.draw();
        apple.draw();
        pApple.draw();
        drawBoarder();
    }, 100);
    
    poisonInterval = setInterval(function() {
        pApple.move();
    }, 5000);

  /*    var gameOver = function () {
        clearInterval(intervalId);
        ctx.font = "60px Courier";
        ctx.fillStyle = "Black";
        ctx.textAlign = "center";
        ctx.textBaseLine = "middle";
        ctx.fillText("Game Over", width / 2, height / 2);
    }; */
     
    //Convert keycodes to directions
    var directions = {
        37: "left",
        38: "up",
        39: "right",
        40: "down"
    };

    //The keydown handler for handling direction key presses
    $("body").keydown(function (event) {
        var newDirection = directions[event.keyCode];
        if (newDirection !== undefined) {
            snake.setDirection(newDirection);
        }
    });
    //Just remember the poison apple functionality
    //it's... (type it in here so you can remember it)
    window.localStorage.getItem('user');
    console.log("getItem ", localStorage.getItem('user'));
}

// Restart the game
function restart() {
    // lcation.reload(); will start a new game.
    // location.reload();
    gamePlay();
    console.log(input);
}

// Load the game page
function gamePage() {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'snake.html', true);
    xhr.responseType = 'text';
    // xhr.overrideMimeType("application/json");
    xhr.onload = function () {
        if (xhr.status === 200) {
            var startPage = document.getElementById('changeMe');
            startPage.innerHTML = xhr.responseText;
            gamePlay();
        }
        /*   document.getElementById('title').style.backgroundColor = "#5bbd23"; */

        document.getElementById('homePage').addEventListener('click', function () {
            home();
        });

        document.getElementById('homePage2').addEventListener('click', function () {
            home(); 
            console.log("You clicked me");
        });

        window.localStorage.getItem('user');
        document.getElementById("playerName").innerHTML = "Player: " + localStorage.getItem('user');
        /*    document.getElementById("highscore").innerHTML = localStorage.getItem("highscore"); */
    } 
    xhr.send();
    console.log("getItem ", localStorage.getItem('user'));
}

// load the home pagef
function home() {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'index.html', true);
    xhr.responseType = 'text';
    // xhr.overrideMimeType("application/json");
    xhr.onload = function () {
        if (xhr.status === 200) {
            var homePage = document.getElementById('changeMe');
            homePage.innerHTML = xhr.responseText;
        }
        /*   document.getElementById('title').style.backgroundColor = "#5bbd23"; */
        document.getElementById("playerName").innerHTML = input;
        document.getElementById('startGame').addEventListener('click', function () {
            gamePage();
        });
        window.localStorage.getItem('user');
        document.getElementById("welcome").innerHTML = "Player :";
        document.getElementById("playerName").innerHTML = localStorage.getItem('user');
    }
    xhr.send();
    console.log("getItem ", localStorage.getItem('user'));
}

// Grabbing user name
function playerInput() {
    var input = document.getElementById("userInput").value;
    if (!input.trim()) {
        input = "Guest";
    }
    console.log(input);
    // Storing player's name
    window.localStorage.setItem('user', input);
    console.log("setItem ", input);
    alert("Player Name Saved");
}

// Grabbing and displaying user name
function msg() {
    var input = document.getElementById("userInput").value;
    if (input == '' || input == '') {
        input = "Guest";
    }
    console.log(input);
    document.getElementById("welcome").innerHTML = "Welcome"
    document.getElementById("playerName").innerHTML = input;
    // Storing player's name
    window.localStorage.setItem('user', input); 
    console.log("setItem ", input);
}

// Keeping track of high scores (Min of top 5 scores)


/* var input = document.getElementById("userInput").value;
input.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        alert("yes it works,I'm happy");
    }
}); */