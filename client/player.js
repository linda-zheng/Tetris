class Player
{
    constructor(element) //, name
    {
        this.factory = new BlockFactory();
        this.block = this.factory.createBlock('T');
        this.board = new Board();
        this.score = 0;

        // ensures that the moving block drops once per second
        this.dropCounter = 0;
        this.dropInterval = 1000;

        // creating the drawer starts the game
        //this.name = name;
        this.element = element;
        this.drawer = new Drawer(this, element);

        // keep track of events
        //this.events = new Events();
    }

    // start the game
    run() {
        this.drawer.run();
    }

    // update the times to figure out when to drop the block
    update(deltaTime) {
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.moveBlock(1, false);
        }
    }

    // get name
    getName() {
        return this.name;
    }

    // get score
    getScore() {
        return this.score;
    }

    // get board 
    getBoard() {
        return this.board;
    }

    // get block
    getBlock() {
        return this.block;
    }

    // reset the block
    resetBlock() {
        const types = 'ILJOTSZ';
        this.block = this.factory.createBlock(types[Math.floor(types.length * Math.random())]);
        // reset the board if there is no space for the new block
        if (this.isCollision()) {
            this.board.clear();
            this.score = 0;
            this.drawer.updateScore();
        }
    }

    // return true if a collision is present
    isCollision() {
        const coord = this.block.getCoordinates();
        for (let y = coord.y_min; y < coord.y_max; ++y) {
            for (let x = coord.x_min; x < coord.x_max; ++x) {
                if (this.block.isFilledAt(x,y) && this.board.isFilledAt(x,y)) {
                    return true;
                }
            }
        }
        return false;
    }

    // place the current block onto the board
    place() {
        //console.table(this.board.getMatrix());
        const coord = this.block.getCoordinates();
        const matrix = this.block.getMatrix();
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.board.setAt(x + coord.x_min, y + coord.y_min, value);
                }
            })
        })
        ///console.table(this.board.getMatrix());
        this.score += this.board.sweep();
        this.drawer.updateScore();
        this.resetBlock();
    }

    // rotate the block
    rotateBlock(dir) {
        // save original position in case rotation is not possible
        const coord = this.block.getCoordinates();
        let offset = 1;
        this.block.rotate(dir);
        // try to move left/right to avoid collision
        while(this.isCollision()) {
            this.block.move(offset, true);
            offset = -(offset + (offset > 0 ? 0 : -1));
            // if we are too far and there is no sucess,
            // don't rotate
            if (offset > (coord.x_max - coord.x_min)) {
                this.block.rotate(-dir);
                this.block.setCoordinates(coord.x_min, coord.y_min);
                return;
            }
        }
    }

    // move the block
    moveBlock(dir, isX) {
        this.block.move(dir, isX);
        if (this.isCollision()) {
            this.block.move(-dir, isX);
            // if we can't move down, we want to place the block
            if (!isX) {
                this.place();
            }
        }
        // if it is a vertical movement, we reset the drop counter
        if (!isX) {
            this.dropCounter = 0;
        }
    }

    // drop the block
    drop() {
        while (!this.isCollision()) {
            this.block.move(+1, false);
        }
        this.block.move(-1, false);
        this.place();
        this.dropCounter = 0;
    }
}

