/**
 * Script for defining the main pingpong game with smoother animations
 */

// the player object
function Player() {
    return {
        x: 1000 - 50,
        y: 50,
        width: 25,
        height: 125,
        velocityY: 0,
    };
}

// Canvas and rendering
function Screen() {
    const canvas = document.getElementById("screen");
    const ctx = canvas.getContext("2d");

    // Function to draw a rectangle
    function drawRectangle(x, y, width, height) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Redraw background
        ctx.fillStyle = 'rgb(57, 255, 20)'; // Set rectangle color
        ctx.fillRect(x, y, width, height); // Draw the rectangle
    }

    return { drawRectangle };
}

// animation loop
function animate() {
    // Update player position
    player.y += player.velocityY;

    // Boundary checking
    player.y = Math.max(0, Math.min(player.y, 500 - player.height)); // Canvas height = 600

    // Redraw the player rectangle
    SCREEN.drawRectangle(player.x, player.y, player.width, player.height);

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

// input listener for making velocity = 0
document.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowUp":
        case "ArrowDown":
            player.velocityY = 0;
            break;
    }
});


// Initialize the player and screen
const player = Player();
const SCREEN = Screen();


// Start the animation loop
animate();
