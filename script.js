// Select the canvas element with id "tetris"
let canvas = document.querySelector("#tetris");

// Select the scoreboard element (an <h2> tag)
let scoreboard = document.querySelector("h2");

// Get the 2D drawing context of the canvas
let ctx = canvas.getContext("2d");

// Scale the canvas so each block is 30x30 pixels
ctx.scale(30,30);

// Define all possible Tetris shapes (pieces) using matrices
const SHAPES = [
    // I-shape
    [
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0]
    ],
    // J-shape
    [
        [0,1,0],  
        [0,1,0],  
        [1,1,0]   
    ],
    // L-shape
    [
        [0,1,0],
        [0,1,0],
        [0,1,1]
    ],
    // S-shape
    [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    // Z-shape
    [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    // T-shape
    [
        [1,1,1],
        [0,1,0],
        [0,0,0]
    ],
    // O-shape (square)
    [
        [1,1],
        [1,1],
    ]
]

// Define colors for each piece (index matches SHAPES)
const COLORS = [
    "#fff",       // empty cell
    "#9b5fe0",    // purple
    "#16a4d8",    // blue
    "#60dbe8",    // light blue
    "#8bd346",    // green
    "#efdf48",    // yellow
    "#f9a52c",    // orange
    "#d64e12"     // red
]

// Define grid size (20 rows, 10 columns)
const ROWS = 20;
const COLS = 10;

// Create the game grid (filled with 0s initially)
let grid = generateGrid();

// Variable to hold the currently falling piece
let fallingPieceObj = null;

// Player score
let score = 0;

// Update game state every 500ms
setInterval(newGameState,500);

// Main game loop: check grid, spawn new piece if needed, move piece down
function newGameState(){
    checkGrid();
    if(!fallingPieceObj){
        fallingPieceObj = randomPieceObject();
        renderPiece();
    }
    moveDown();
}

// Check if any row is completely filled, remove it, and update score
function checkGrid(){
    let count = 0;
    for(let i=0;i<grid.length;i++){
        let allFilled = true;
        for(let j=0;j<grid[0].length;j++){
            if(grid[i][j] == 0){
                allFilled = false
            }
        }
        if(allFilled){
            count++;
            grid.splice(i,1); // remove filled row
            grid.unshift([0,0,0,0,0,0,0,0,0,0]); // add empty row at top
        }
    }
    // Update score based on number of rows cleared
    if(count == 1){
        score+=10;
    }else if(count == 2){
        score+=30;
    }else if(count == 3){
        score+=50;
    }else if(count>3){
        score+=100
    }
    scoreboard.innerHTML = "Score: " + score;
}

// Generate an empty grid (all cells = 0)
function generateGrid(){
    let grid = [];
    for(let i=0;i<ROWS;i++){
        grid.push([]);
        for(let j=0;j<COLS;j++){
            grid[i].push(0)
        }
    }
    return grid;
}

// Create a random piece object with shape, color, and starting position
function randomPieceObject(){
    let ran = Math.floor(Math.random()*7);
    let piece = SHAPES[ran];
    let colorIndex = ran+1;
    let x = 4; // start near middle
    let y = 0; // start at top
    return {piece,colorIndex,x,y}
}

// Render the currently falling piece on the canvas
function renderPiece(){
    let piece = fallingPieceObj.piece;
    for(let i=0;i<piece.length;i++){
        for(let j=0;j<piece[i].length;j++){
            if(piece[i][j] == 1){
                ctx.fillStyle = COLORS[fallingPieceObj.colorIndex];
                ctx.fillRect(fallingPieceObj.x+j,fallingPieceObj.y+i,1,1);
            }
        }
    }
}

// Move piece down one step; if collision, lock piece into grid
function moveDown(){
    if(!collision(fallingPieceObj.x,fallingPieceObj.y+1))
        fallingPieceObj.y+=1;
    else{
        let piece = fallingPieceObj.piece
        for(let i=0;i<piece.length;i++){
            for(let j=0;j<piece[i].length;j++){
                if(piece[i][j] == 1){
                    let p = fallingPieceObj.x+j;
                    let q = fallingPieceObj.y+i;
                    grid[q][p] = fallingPieceObj.colorIndex;
                }
            }
        }
        // If piece locks at top → game over
        if(fallingPieceObj.y == 0){
            alert("gamer over");
            grid = generateGrid();
            score = 0;
        }
        fallingPieceObj = null;
    }
    renderGame();
}

// Move piece left
function moveLeft(){
    if(!collision(fallingPieceObj.x-1,fallingPieceObj.y))
        fallingPieceObj.x-=1;
    renderGame();
}

// Move piece right
function moveRight(){
    if(!collision(fallingPieceObj.x+1,fallingPieceObj.y))
        fallingPieceObj.x+=1;
    renderGame();
}

// Rotate piece clockwise
function rotate(){
    let rotatedPiece = [];
    let piece = fallingPieceObj.piece;
    // Create empty matrix
    for(let i=0;i<piece.length;i++){
        rotatedPiece.push([]);
        for(let j=0;j<piece[i].length;j++){
            rotatedPiece[i].push(0);
        }
    }
    // Transpose matrix
    for(let i=0;i<piece.length;i++){
        for(let j=0;j<piece[i].length;j++){
            rotatedPiece[i][j] = piece[j][i]
        }
    }
    // Reverse rows to complete rotation
    for(let i=0;i<rotatedPiece.length;i++){
        rotatedPiece[i] = rotatedPiece[i].reverse();
    }
    // Apply rotation if no collision
    if(!collision(fallingPieceObj.x,fallingPieceObj.y,rotatedPiece))
        fallingPieceObj.piece = rotatedPiece
    renderGame()
}

// Check if piece collides with walls or other blocks
function collision(x,y,rotatedPiece){
    let piece = rotatedPiece || fallingPieceObj.piece
    for(let i=0;i<piece.length;i++){
        for(let j=0;j<piece[i].length;j++){
            if(piece[i][j] == 1){
                let p = x+j;
                let q = y+i;
                if(p>=0 && p<COLS && q>=0 && q<ROWS){
                    if(grid[q][p]>0){
                        return true;
                    }
                }else{
                    return true;
                }
            }
        }
    }
    return false;
}

// Render the entire game grid and the falling piece
function renderGame(){
    for(let i=0;i<grid.length;i++){
        for(let j=0;j<grid[i].length;j++){
            ctx.fillStyle = COLORS[grid[i][j]];
            ctx.fillRect(j,i,1,1)
        }
    }
    renderPiece();
}

// Listen for keyboard input to control the piece
document.addEventListener("keydown",function(e){
    let key = e.key;
    if(key == "ArrowDown"){
        moveDown();
    }else if(key == "ArrowLeft"){
        moveLeft();
    }else if(key == "ArrowRight"){
        moveRight();
    }else if(key == "ArrowUp"){
        rotate();
    }
})
