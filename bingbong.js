/**
 * Script for defining the main pingpong game
 */

var currentGameMode, selectedGameMode;
var animationFrame;

// The player object
function Drawable(x, y, width, height, velocityX, velocityY) {
    return {
        x,
        y,
        width,
        height,
        velocityX,
        velocityY,
    };
}

// Canvas and rendering
function Screen() {
    const canvas = document.getElementById("screen");
    const ctx = canvas.getContext("2d");
    canvas.focus();

    // draw a rectangle
    function drawRectangle(x, y, width, height) {
        var styles = getComputedStyle(document.getElementById('screen'));
        var color = styles.getPropertyValue('color')
        ctx.fillStyle = color;
        //ctx.fillStyle = 'rgb(57, 255, 20)'; // Set rectangle color
        ctx.fillRect(x, y, width, height); // Draw the rectangle
    }

    // clear the canvas
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
        var styles = getComputedStyle(document.getElementById('screen'));
        var color = styles.getPropertyValue('background-color')
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Redraw the black background
    }

    return {
        drawRectangle,
        clearCanvas,
        canvas
    };
}

// Ball logic
function ballController() {
    // Handle top and bottom wall collisions
    if (ball.y <= 0 || ball.y + ball.height >= SCREEN.canvas.height) {
        ball.velocityY *= -1; // Reverse Y direction
    }

    // Handle collision with the player
    if (
        ball.x + ball.width >= player.x &&
        ball.y + ball.height >= player.y &&
        ball.y <= player.y + player.height
    ) {
        ball.velocityX *= -1; // Reverse X direction

        // Calculate how far the ball is from the center of the paddle
        const paddleCenterY = player.y + player.height / 2;
        const hitPositionY = ball.y + ball.height / 2;  // The vertical center of the ball at the point of contact
        const distanceFromCenter = hitPositionY - paddleCenterY;

        // Scale the Y velocity based on how far from the center it hit
        const maxDeflection = 4; // Max speed at the edges of the paddle
        const deflectionFactor = distanceFromCenter / (player.height / 2); // Normalize distance (-1 to 1)
        ball.velocityY = deflectionFactor * maxDeflection; // Adjust Y velocity

        // Calculate total velocity to maintain constant speed
        const totalSpeed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2); // Current speed
        const desiredSpeed = currentGameMode === "hardcore" ? 15 : 10; // Constant total speed

        ball.velocityX *= desiredSpeed / totalSpeed; // Adjust X velocity to maintain constant speed
        ball.velocityY *= desiredSpeed / totalSpeed; // Adjust Y velocity to maintain constant speed

    }

    if (currentGameMode == "blockbreaker") {
        for (let i = 0; i < BLOCKS.length; i++) {
            const block = BLOCKS[i];
            if (
                ball.x < block.x + block.width &&
                ball.x + ball.width > block.x &&
                ball.y < block.y + block.height &&
                ball.y + ball.height > block.y
            ) {
                ball.velocityX *= -1; 
                BLOCKS.splice(i, 1);

                break;
            }
        }
        if (ball.x < 0) {
            ball.velocityX *= -1;
        }
        else if (ball.x > SCREEN.canvas.width) {
            resetBall();
        }
    }
    else {
        // Handle collision with the ENEMY
        if (
            ball.x <= ENEMY.x + ENEMY.width &&
            ball.y + ball.height >= ENEMY.y &&
            ball.y <= ENEMY.y + ENEMY.height
        ) {
            ball.velocityX *= -1; // Reverse X direction

            // Calculate how far the ball is from the center of the enemy paddle
            const paddleCenterY = ENEMY.y + ENEMY.height / 2;
            const hitPositionY = ball.y + ball.height / 2;  // The vertical center of the ball at the point of contact
            const distanceFromCenter = hitPositionY - paddleCenterY;

            // Scale the Y velocity based on how far from the center it hit
            const maxDeflection = 4; // Max speed at the edges of the paddle
            const deflectionFactor = distanceFromCenter / (ENEMY.height / 2); // Normalize distance (-1 to 1)
            ball.velocityY = deflectionFactor * maxDeflection; // Adjust Y velocity

            // Calculate total velocity to maintain constant speed
            const totalSpeed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2); // Current speed
            const desiredSpeed = currentGameMode === "hardcore" ? 15 : 10; // Constant total speed

            ball.velocityX *= desiredSpeed / totalSpeed; // Adjust X velocity to maintain constant speed
            ball.velocityY *= desiredSpeed / totalSpeed; // Adjust Y veloc
        }
        
        // Reset ball if it goes past the player or ENEMY
        // Reset ball if it goes past the player or ENEMY
        if (ball.x < 0) { // the player wins
            player.score += 1
            resetBall();
        } else if (ball.x > SCREEN.canvas.width) { // the enemy wins
            ENEMY.score += 1
            resetBall();
        }
    }
}


// Enemy controller logic
function enemyController() {
    const centerY = ENEMY.y + ENEMY.height / 2;

    // Move up if ball is above the enemy paddle
    if (ball.y + ball.height / 2 < centerY) {
        ENEMY.velocityY = currentGameMode === "hardcore" ? -3 : -1; // Move up
    }
    // Move down if ball is below the enemy paddle
    else if (ball.y + ball.height / 2 > centerY) {
        ENEMY.velocityY = currentGameMode === "hardcore" ? 3 : 1; // Move down
    }
    // Stop moving if the enemy paddle is aligned with the ball
    else {
        ENEMY.velocityY = 0;
    }

    // Boundary checking for the enemy paddle
    ENEMY.y = Math.max(0, Math.min(ENEMY.y + ENEMY.velocityY, SCREEN.canvas.height - ENEMY.height));
}

function updateScores() {
    document.getElementById('enemy-score').innerHTML = ENEMY.score
    document.getElementById('player-score').innerHTML = player.score

}

// Reset the ball to the center with a new random trajectory
function resetBall() {
    ball.x = SCREEN.canvas.width / 2 - ball.width / 2;
    ball.y = SCREEN.canvas.height / 2 - ball.height / 2;
    ball.velocityX = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2); // Random velocity
    ball.velocityY = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2); // Random velocity


    if (currentGameMode == "hardcore") {
        ball.velocityX *= 2;
        ball.velocityY *= 2;
    }
    // update the scores
    updateScores()
}

// Main game loop. Animates and calls logic every frame.
function animate() {
    // Clear the canvas at the start of the frame
    SCREEN.clearCanvas();
    ballController();

    if(currentGameMode == "default" || currentGameMode == "hardcore")
    {
        enemyController();
    }

    // Update and redraw all drawables
    for (let i = 0; i < DRAWABLES.length; i++) {
        const d = DRAWABLES[i];
        // Update position
        d.x += d.velocityX;
        d.y += d.velocityY;

        // Boundary checking
        d.y = Math.max(0, Math.min(d.y, SCREEN.canvas.height - d.height));

        // Draw the drawable
        SCREEN.drawRectangle(d.x, d.y, d.width, d.height);
    }

    if (currentGameMode == "blockbreaker") {
        for (const block of BLOCKS) {
            SCREEN.drawRectangle(block.x, block.y, block.width, block.height);
        }

        if(BLOCKS.length == 0) {
            alert('win screen for block breaker');
        }
    }

    // Request the next frame
    animationFrame = requestAnimationFrame(animate);
}

// Input listeners to update player velocity
document.addEventListener("keydown", (event) => {
    event.preventDefault();
    switch (event.key) {
        case "ArrowUp":
            player.velocityY = -5;
            break;
        case "ArrowDown":
            player.velocityY = 5;
            break;
    }
});

// Input listener for stopping movement
document.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowUp":
        case "ArrowDown":
            player.velocityY = 0;
            break;
    }
});

// Input listeners to update enemy's velocity if multiplayer is selected
document.addEventListener("keydown", (event) => {
    if(currentGameMode == "multiplayer")
    {
        switch (event.key) {
            case "w":
                ENEMY.velocityY = -5;
                break;
            case "s":
                ENEMY.velocityY = 5;
                break;
        }
    }
});

// Input listener for stopping movement
document.addEventListener("keyup", (event) => {
    if(currentGameMode == "multiplayer") {
        switch (event.key) {
        case "w":
        case "s":
            ENEMY.velocityY = 0;
            break;
        }
    }
});

// Initialize the screen and drawables
const SCREEN = Screen();

const PLAYER_WIDTH = 25;
const PLAYER_HEIGHT = 125;
const player = Drawable(
    x = SCREEN.canvas.width - 50,
    y = (SCREEN.canvas.height / 2) - (PLAYER_HEIGHT / 2),
    width = PLAYER_WIDTH,
    height = PLAYER_HEIGHT,
    velocityX = 0,
    velocityY = 0,
    score=0
);

const ENEMY_WIDTH = 25;
const ENEMY_HEIGHT = 125;
const ENEMY = Drawable(
    x = 50 - ENEMY_WIDTH,
    y = (SCREEN.canvas.height / 2) - (ENEMY_HEIGHT / 2),
    width = ENEMY_WIDTH,
    height = ENEMY_HEIGHT,
    velocityX = 0,
    velocityY = 1,
    score=0
);

const BALL_WIDTH = 20;
const BALL_HEIGHT = 20;
const ball = Drawable(
    x = SCREEN.canvas.width / 2 - BALL_WIDTH / 2,
    y = SCREEN.canvas.height / 2 - BALL_HEIGHT / 2,
    width = BALL_WIDTH,
    height = BALL_HEIGHT,
    velocityX = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2), // Random initial velocity X
    velocityY = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2)  // Random initial velocity Y
);

const DRAWABLES = [player, ball, ENEMY];

var BLOCKS = [];

function setupBlocks() {
    const blockWidth = 20;
    const blockHeight = 50;
    const cols = 5;
    const rows = Math.floor(SCREEN.canvas.height / (blockHeight + 10));
    const padding = 10;

    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            const x = col * (blockWidth + padding) + padding;
            const y = row * (blockHeight + padding);

            BLOCKS.push(Drawable(x, y + 10, blockWidth, blockHeight, 0, 0));
        }
    }
}



// style stuff, we can deal with this later

// function changeStyle() {
//   newStyle = "styles/" + document.getElementById('styles').value + "/menu.css";
//   document.getElementById("styleSheet").href = newStyle;
// }

function setMode(button, mode){
  Array.from(document.getElementsByClassName("play-mode-button")).forEach(element => {
    element.style.borderColor = 'black';
  });
  button.style.borderColor = 'white';
  this.selectedGameMode = mode;
}

function start() {
  if (!selectedGameMode) {
    alert("You must select a mode before starting the game.")
    return;
  }

  // breaking out of the recursive animate loop upon mode switch to prevent infinite speedups (this took so long to fix lol)
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }

  currentGameMode = selectedGameMode;

    DRAWABLES.length = 0;
    DRAWABLES.push(player, ball);
    if (currentGameMode !== "blockbreaker") {
        DRAWABLES.push(ENEMY);
    }

    // setup for block break
    if(currentGameMode == "blockbreaker"){
        setupBlocks();
        resetDrawables();
        ENEMY.width = 0;
        ENEMY.height = 0;
    }

    // setup for multiplayer
    else if(currentGameMode == "multiplayer")
    {
        resetDrawables();
        ENEMY.velocityY = 0;
        ENEMY.width = ENEMY_WIDTH;
        ENEMY.height = ENEMY_HEIGHT;
    }

    // setup for default
    else if (currentGameMode == "default" || currentGameMode == "hardcore") {
        resetDrawables();
        ENEMY.velocityY = 1;
        ENEMY.width = ENEMY_WIDTH;
        ENEMY.height = ENEMY_HEIGHT;
        ENEMY.score = 0;
        player.score = 0;
        updateScores()
    }
    
    // Start the animation loop
    animate();
}

document.addEventListener("DOMContentLoaded", () => {
    const checkbox = document.getElementById("menuToggle");
    const menu = document.getElementById("menu");

    // hook up to checkbox change event
    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            menu.style.display = "none";
        } else {
            menu.style.display = "block";
        }
    });
});

function resetDrawables()
{
    player.x = SCREEN.canvas.width - 50;
    player.y = (SCREEN.canvas.height / 2) - (PLAYER_HEIGHT / 2);
    player.width = PLAYER_WIDTH;
    player.height = PLAYER_HEIGHT;
    player.velocityX = 0;
    player.velocityY = 0;

    ENEMY.x = 50 - ENEMY_WIDTH;
    ENEMY.y = (SCREEN.canvas.height / 2) - (ENEMY_HEIGHT / 2);
    ENEMY.width = ENEMY_WIDTH;
    ENEMY.height = ENEMY_HEIGHT;
    ENEMY.velocityX = 0;
    ENEMY.velocityY = 1;
    
    resetBall();
}
