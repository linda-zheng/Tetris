class Block {
    constructor() {
        this.matrix = [[]];
        this.pos = {x:0, y:0};
    }

    // returns true if the block is filled at the given location
    isFilledAt(x,y) {
        return (this.matrix[y-this.pos.y] && this.matrix[y-this.pos.y][x-this.pos.x]) !== 0;
    }

    // set block to center
    setToCenter(boardWidth) {
        this.pos = {x: Math.floor(boardWidth/2 - this.matrix[0].length/2), y: 0};
    }

    // set coordinates of block
    setCoordinates(x,y) {
        this.pos = {x: x, y: y};
    }

    // get coordinates of block
    getCoordinates() {
        return {
            x_min: this.pos.x,
            x_max: this.pos.x + this.matrix.length,
            y_min: this.pos.y,
            y_max: this.pos.y + this.matrix[0].length,
        }
    }

    // return the matrix
    getMatrix() {
        return this.matrix;
    }

    // move the block left/right/up/down
    move(dir, isX) {
        if (isX) {
            this.pos.x += dir;
        } else {
            this.pos.y += dir;
        }
        
    }

    // rotate the block
    // rotate the matrix
    rotate(dir) {
        // assume matrix is a square
        for (let y = 0; y < this.matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [this.matrix[x][y], this.matrix[y][x]] = [this.matrix[y][x], this.matrix[x][y]];
            }
        }
        if (dir > 0) {
            this.matrix.forEach(row => row.reverse());
        } else {
            this.matrix.reverse();
        }
    }
    
}