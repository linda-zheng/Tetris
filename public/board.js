class Board {
    constructor(w=12, h=20) {
        this.w = w;
        this.h = h;
        this.matrix = [];
        this.clear();
    }

    // set matrix to all zeros
    clear() {
        const M = [];
        for (let y = 0; y < this.h; ++y) {
            M.push(new Array(this.w).fill(0));
        }
        this.matrix = M;
    }

    // sweep and clear full rows
    // return the score
    sweep() {
        let rowCount = 1;
        let score = 0;
        outer: for (let y = this.h-1; y >= 0; --y) {
            for (let x = 0; x < this.w; ++x) {
                if (this.matrix[y][x] == 0 || this.matrix[y][x] == 8) {
                    // if row is not fully populated
                    // or if row is solid block
                    continue outer;
                }
            }
            // remove the row and set it to all zeros
            const row = this.matrix.splice(y,1)[0].fill(0);
            // add the row back to the top
            this.matrix.unshift(row);
            // since a row was shifted, we need to modify the y
            ++y;

            // update score based on rows cleared
            score += rowCount * 10;
            rowCount *= 2;
        }
        return score;
    }
        
    // returns true if the board is filled at the given location
    isFilledAt(x,y) {
        return (this.matrix[y] && this.matrix[y][x]) !== 0
    }

    // set the value at the given x,y-coordinates
    // expects valid x,y-coordinates
    setAt(x,y,val) {
        this.matrix[y][x] = val;
    }

    // get matrix
    getMatrix() {
        return this.matrix;
    }

    // push up by one row
    pushUp() {
        // remove top row
        const row = this.matrix.splice(0,1)[0].fill(8);
        // add the row to the bottom
        this.matrix.push(row);
    }

    // generate random mosaic of board
    random() {
        for (let y = this.h-1; y >= 0; --y) {
            for (let x = 0; x < this.w; ++x) {
                this.matrix[y][x] = Math.floor(7 * Math.random()) + 1;
            }
        }

    }
}



