/**
 * Script for defining the main pingpong game
 */

var currentGameMode, selectedGameMode;
var mainAnimationRunning = true;
var mainAnimationFrame = null;
var secondaryAnimationFrame;

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
        bounce = document.getElementById("bounce");
        bounce.pause();
        bounce.currentTime = 0;
        bounce.play();

        // Adjust ball position to prevent overlap horizontally
        ball.x = player.x - ball.width; // Place the ball outside the paddle

        // Adjust ball position to prevent overlap vertically
        if (ball.y + ball.height > player.y + player.height) {
            ball.y = player.y + player.height; // Place ball below the paddle
        } else if (ball.y < player.y) {
            ball.y = player.y - ball.height; // Place ball above the paddle
        }

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
        for (let i = BLOCKS.length - 1; i >= 0; i--) {
            const block = BLOCKS[i];
            if (
                ball.x + ball.width > block.x &&
                ball.x < block.x + block.width &&
                ball.y + ball.height > block.y &&
                ball.y < block.y + block.height
            ) {
                // play the sound
                bounce = document.getElementById("bounce");
                bounce.pause();
                bounce.currentTime = 0;
                bounce.play();
    
                ball.velocityX *= -1;
    
                // remove the block
                BLOCKS.splice(i, 1);
    
                // update player score
                player.score += 1;
                updateScores();
    
                break;
            }
        }
        if (ball.x < 0) {
            ball.velocityX *= -1;
        } else if (ball.x > SCREEN.canvas.width) {
            player.lives -= 1; // Decrement lives
            updateScores();
            scoreExplosion(ball.x, ball.y);
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
            bounce = document.getElementById("bounce");
            bounce.pause();
            bounce.currentTime = 0;
            bounce.play();
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
            player.score += 1;
            scoreExplosion(ball.x, ball.y);
            resetBall();
        } else if (ball.x > SCREEN.canvas.width) { // the enemy wins
            ENEMY.score += 1;
            scoreExplosion(ball.x, ball.y);
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
    if (currentGameMode === "blockbreaker") {
        document.getElementById('enemyScore').innerHTML = `Lives: ${player.lives}`;
        document.getElementById('playerScore').innerHTML = `Score: ${player.score}`;
    } else {
        document.getElementById('enemyScore').innerHTML = ENEMY.score;
        document.getElementById('playerScore').innerHTML = player.score;
    }
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
    updateScores();
}

// Main game loop. Animates and calls logic every frame.
function animate() {
    if(!mainAnimationRunning) return;

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
            // alert('win screen for block breaker');
            gameOver("You won block breaker!");
        }
    }

    // Request the next frame
    mainAnimationFrame = requestAnimationFrame(animate);
}

const WINNING_SCORE = 3;

// score animation
function explode(particles, callback){
    let startTime = null;

    function run(timestamp) {

        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        // Run for 1 seconds
        if (elapsed < 1000) {

            SCREEN.clearCanvas();

            // Update and redraw all particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                // Update position
                p.x += p.velocityX;
                p.y += p.velocityY;
                // draw the particle
                SCREEN.drawRectangle(p.x, p.y, p.width, p.height);
            }
            // recursive call that keeps animating the explosion
            secondaryAnimationFrame = requestAnimationFrame(run);

        } else {
            callback(); // Call the callback to resume main animation
        }
    }
    requestAnimationFrame(run); // timestamp is automatically provided by requestAnimationFrame
}

function gameOver(winnerString){
    // stopping animation so it isn't moving in the background of the game over screen
    mainAnimationRunning = false;
    if (mainAnimationFrame) cancelAnimationFrame(mainAnimationFrame);
    // Set continuePanel state to "menu" (this removes continue option)
    document.getElementById("continuePanel").dataset.state = "menu";
    // Display winner string
    document.getElementById("gameOver").innerHTML = winnerString;

    document.getElementById("menu").style.display = "block";
    document.getElementById("pauseContainer").style.visibility = "hidden";
}

// Pause the main animation and run the secondary animation
function scoreExplosion(ballX, ballY) {
    if (mainAnimationRunning) {
        // pause main animation
        mainAnimationRunning = false;
        cancelAnimationFrame(mainAnimationFrame);

        if ((currentGameMode == "default" || currentGameMode == "hardcore") && player.score == WINNING_SCORE){
            gameOver("You win!");
        } else if ((currentGameMode == "default" || currentGameMode == "hardcore") && ENEMY.score == WINNING_SCORE){
            gameOver("You lose!");
        } else if (currentGameMode == "multiplayer" && player.score == WINNING_SCORE) {
            gameOver("Right player wins!");
        } else if (currentGameMode == "multiplayer" && ENEMY.score == WINNING_SCORE) {
            gameOver("Left player wins!");
        } else if (currentGameMode == "blockbreaker" && player.lives == 0) {
            gameOver("You lose!");
        } else {
            // create particles
            let particles = [];
            for (i = 0; i <= 1500; i++) {
                let size = Math.random() * 3;
                let particle = Drawable(
                    x = ballX,
                    y = ballY, 
                    width = size,
                    height = size, 
                    velocityX = (Math.random() - 0.5) * (Math.random() * 6), 
                    velocityY = (Math.random() - 0.5) * (Math.random() * 6),
                );
                // draw initial particles
                SCREEN.drawRectangle(particle.x, particle.y, particle.width, particle.height);
                particles.push(particle);
            }

            // calls the explode function with particles and an anonymous call back function
            explode(particles, () => {
                // restarts the main animation
                mainAnimationRunning = true;
                requestAnimationFrame(animate);
            });
        }
    }
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

// Input listener for pause
function pauseGame(){
    if (mainAnimationFrame) cancelAnimationFrame(mainAnimationFrame);
    console.log("Pause game now!");
    const menu = document.getElementById("menu");
    menu.style.display = "block";

    document.getElementById("pauseContainer").style.visibility = "hidden";
    // make the continue game button visible
    document.getElementById("continuePanel").dataset.state = "pause";
}

document.addEventListener("keydown", (event) => {
    event.preventDefault();
    if (event.key === "Escape"){
        pauseGame();
    }
});

// simple continue function from pause menu input
function keepPlaying(){
    console.log("continue");
    // hide main menu, display pause button
    document.getElementById("menu").style.display = "none";
    document.getElementById("pauseContainer").style.visibility = "visible";
    
    if (!mainAnimationRunning) {
        // continue main animation
        mainAnimationRunning = true;
        requestAnimationFrame(animate);
    }

    animate();
}

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
    score = 0,
    lives = 3
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
    document.getElementById("backgroundMusic").play();
    if (!selectedGameMode) {
        alert("You must select a mode before starting the game.")
        return;
    }

    // breaking out of the recursive animate loop upon mode switch to prevent infinite speedups (this took so long to fix lol)
    if (mainAnimationFrame) {
        cancelAnimationFrame(mainAnimationFrame);
    }

    // This resets the game after gameOver
    mainAnimationRunning = true;
    document.getElementById("gameOver").innerHTML = "";
  
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
        player.lives = 3;
        player.score = 0;
        ENEMY.score = 0;
        updateScores();
    }

    // setup for multiplayer
    else if(currentGameMode == "multiplayer")
    {
        resetDrawables();
        ENEMY.velocityY = 0;
        ENEMY.width = ENEMY_WIDTH;
        ENEMY.height = ENEMY_HEIGHT;
        player.score = 0;
        ENEMY.score = 0;
        updateScores();
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

    // reset scores
    document.getElementById('enemyScore').innerHTML = "";
    document.getElementById('playerScore').innerHTML = "";

    // hide main menu, display pause button
    document.getElementById("menu").style.display = "none";
    document.getElementById("pauseContainer").style.visibility = "visible";

    animate();
}


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
