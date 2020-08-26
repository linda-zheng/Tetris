const canvas = document.getElementById("tetris");
const context = canvas.getContext('2d');

// make everything 20 times bigger
context.scale(20, 20);

// paint the background of the tetris board
context.fillStyle = '#000';
context.fillRect(0, 0, canvas.width, canvas.height);

const matrix = [
    [0,0,0],
    [1,1,1],
    [0,1,0],
];

// return true if a collision is present
function isCollision(board, block) {
    const [m, o] = [block.matrix, block.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (board[y+o.y] && board[y+o.y][x+o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// sweep the board and clear full rows
function sweepBoard() {
    let rowCount = 1;
    outer: for (let y = board.length-1; y >= 0; --y) {
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] == 0) {
                // if row is not fully populated
                continue outer;
            }
        }
        // remove the row and set it to all zeros
        const row = board.splice(y,1)[0].fill(0);
        // add the row back to the top
        board.unshift(row);
        // since a row was shifted, we need to modify the y
        ++y;

        // update score based on rows cleared
        score += rowCount * 10;
        rowCount *= 2;

    }
}

// create matrix of zeros with given width and height
function createMatrixOfZeros(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// place the current block onto the board
function place(board, block) {
    block.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + block.pos.y][x + block.pos.x] = value;
            }
        })
    })
    sweepBoard();
    updateScore();
    resetBlock();
}

// draw the current block
function draw() {
    // clear the board
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(board, {x: 0, y: 0});

    // draw the new block
    drawMatrix(block.matrix, block.pos);
}

// colours for rectangles
const colours = [
    null,
    '#DCA3C2',
    '#C7CEF4',
    '#D1A69B',
    '#7894CF',
    '#9B9655',
    '#97D2E1',
    '#F5D788',
]

// draw the matrix with offset on the board
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colours[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        })
    })
}

// drop the block by one square
function dropByOne() {
    block.pos.y++;
    // if the block has reached the bottom (or another block),
    // then place the block
    if (isCollision(board, block)) {
        block.pos.y--;
        place(board, block);
    }
    // reset drop counter to allow 1 second delay at new position
    dropCounter = 0;
}

// move the block left or right
function moveBlock(dir) {
    block.pos.x += dir;
    if (isCollision(board, block)) {
        block.pos.x -= dir;
    }
}

// rotate the block
function rotateBlock(dir) {
    const pos = block.pos.x;
    let offset = 1;
    rotate(block.matrix, dir);
    // try to move left/right to avoid collision
    while(isCollision(board, block)) {
        block.pos.x += offset;
        offset = -(offset + (offset > 0 ? 0 : -1));
        // if we are too far and there is no sucess,
        // don't rotate
        if (offset > block.matrix[0].length) {
            rotate(block.matrix, -dir);
            block.pos.x = pos;
            return;
        }
    }
}

// rotate the matrix
function rotate(matrix, dir) {
    // assume matrix is a square
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// variables to keep track of drop times 
// ensures that the moving block drops once per second
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// update the block
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        dropByOne();
    }
    draw();
    requestAnimationFrame(update);
}

var board = createMatrixOfZeros(12, 20);
const factory = new BlockFactory();

// initialize the block factory
function BlockFactory() {
    this.createBlock = function(type) {
        var block;
        if (type == 'T') {
            block = new TBlock();
        } else if (type == 'O') {
            block = new OBlock();
        } else if (type == 'L') {
            block = new LBlock();
        }  else if (type == 'J') {
            block = new JBlock();
        } else if (type == 'I') {
            block = new IBlock();
        } else if (type == 'S') {
            block = new SBlock();
        } else {
            block = new ZBlock();
        }

        block.pos = {x: Math.floor(board[0].length/2 - block.matrix[0].length/2), y: 0};
        return block;
    }
}

// create the T block
var TBlock = function () {
    this.matrix = [
        [1,1,1],
        [0,1,0],
        [0,0,0],
    ];
}

// create the O block
var OBlock = function () {
    this.matrix = [
        [2,2],
        [2,2],
    ];
}

// create the L block
var LBlock = function () {
    this.matrix = [
        [0,3,0],
        [0,3,0],
        [0,3,3],
    ];
}

// create the J block
var JBlock = function () {
    this.matrix = [
        [0,4,0],
        [0,4,0],
        [4,4,0],
    ];
}

// create the I block
var IBlock = function () {
    this.matrix = [
        [0,5,0,0],
        [0,5,0,0],
        [0,5,0,0],
        [0,5,0,0],
    ];
}

// create the S block
var SBlock = function () {
    this.matrix = [
        [0,6,6],
        [6,6,0],
        [0,0,0],
    ];
}

// create the Z block
var ZBlock = function () {
    this.matrix = [
        [7,7,0],
        [0,7,7],
        [0,0,0],
    ];
}

// reset the block
function resetBlock() {
    const types = 'ILJOTSZ';
    block = factory.createBlock(types[Math.floor(types.length * Math.random())]);
    // reset the board if there is no space for the new block
    if (isCollision(board, block)) {
        board = createMatrixOfZeros(12, 20);
        score = 0;
        updateScore();
    }
}

// update the score
function updateScore() {
   document.getElementById('score').innerText = "Score: "+score;
}

var block = factory.createBlock('T');
var score = 0;
// event listener for left/right/down movement
document.addEventListener('keydown', event => {
    if (event.keyCode == 37) {
        moveBlock(-1);
    } else if (event.keyCode == 39) {
        moveBlock(+1);
    } else if (event.keyCode == 40) {
        dropByOne();
    } else if (event.keyCode == 81) {
        rotateBlock(-1);
    } else if (event.keyCode == 87) {
        rotateBlock(+1);
    }
})

update();