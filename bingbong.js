/**
 * Script for defining the main pingpong game 
 */

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

    // draw a rectangle
    function drawRectangle(x, y, width, height) {
        ctx.fillStyle = 'rgb(57, 255, 20)'; // Set rectangle color
        ctx.fillRect(x, y, width, height); // Draw the rectangle
    }

    // clear the canvas
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
        ctx.fillStyle = "black";
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
    }

    // Handle collision with the wall
    if (
        ball.x <= WALL.x + WALL.width &&
        ball.y + ball.height >= WALL.y &&
        ball.y <= WALL.y + WALL.height
    ) {
        ball.velocityX *= -1; // Reverse X direction
    }

    // Reset ball if it goes past the player or wall
    if (ball.x < 0 || ball.x > SCREEN.canvas.width) {
        resetBall();
    }
}

// Reset the ball to the center with a new random trajectory
function resetBall() {
    ball.x = SCREEN.canvas.width / 2 - ball.width / 2;
    ball.y = SCREEN.canvas.height / 2 - ball.height / 2;
    ball.velocityX = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2); // Random velocity
    ball.velocityY = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2); // Random velocity
}

// Main game loop. Animates and calls logic every frame.
function animate() {
    // Clear the canvas at the start of the frame
    SCREEN.clearCanvas();
    ballController();

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

    // Request the next frame
    requestAnimationFrame(animate);
}

// Input listeners to update player velocity
document.addEventListener("keydown", (event) => {
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
    velocityY = 0
);

const WALL = Drawable(
    x = 0, 
    y = 0, 
    width = 25,
    height = SCREEN.canvas.height,
    velocityX = 0,
    velocityY = 0
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

const DRAWABLES = [player, WALL, ball];

// Start the animation loop
animate();
