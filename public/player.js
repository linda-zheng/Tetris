class Player
{
    constructor(element, name, isLocal = false) //, name
    {   
        // setting up basic data members
        this.events = new Events();
        this.score = 0;
        this.board = new Board();
        this.factory = new BlockFactory();
        this.block = this.resetBlock();
        this.heldBlock = null;
        this.nextBlock = this.resetBlock();
        this.name = name;
        this.isGameOver = false;

        // ensures that the moving block drops once per second
        this.dropCounter = 0;
        this.dropInterval = 1000;

        // creating the drawer starts the game
        //this.name = name;
        this.element = element;
        this.drawer = new Drawer(this, element, isLocal);
        this.drawer.updateScore(0);
        this.drawer.drawBlocks();
        this.drawer.drawName();
        
        // events that trigger callbacks when different data members are changed
        this.events.listen('score', score => {this.drawer.updateScore(score);});

        // after constructor, the entire state is serialized and sent to server
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
        const block = this.factory.createBlock(types[Math.floor(types.length * Math.random())]);
        return block;
    }

    // return true if a collision is present
    isCollision(block) {
        const coord = block.getCoordinates();
        for (let y = coord.y_min; y < coord.y_max; ++y) {
            for (let x = coord.x_min; x < coord.x_max; ++x) {
                if (block.isFilledAt(x,y) && this.board.isFilledAt(x,y)) {
                    return true;
                }
            }
        }
        return false;
    }

    // initialize game over sequence
    // clear board and blocks 
    // update score
    gameOver(score) {
        this.block = null;
        this.nextBlock = null;
        this.heldBlock = null;
        this.board.random();
        this.drawer.drawGameOver(score);
        this.isGameOver = true;
    }

    // add a row of blocks below
    pushUp() {
        // check that top row isn't empty
        for (let i = 0; i < this.board.matrix[0].length; ++i) {
            if (this.board.matrix[0][i] != 0) {
                console.log("game over");
                this.gameOver(this.score);
                this.events.emit("gameOver", this.score);
                return;
            }
        }
        this.board.pushUp();
        // move the current block to a good spot
        if (this.isCollision(this.block)) {
            this.block.pos.y--;
            if (this.block.pos.y < 0) {
                console.log("game over");
                this.gameOver(this.score);
                this.events.emit("gameOver", this.score);
                return;
            }
        }
        this.drawer.draw();
    }

    // place the current block onto the board
    place() {
        const coord = this.block.getCoordinates();
        const matrix = this.block.getMatrix();
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.board.setAt(x + coord.x_min, y + coord.y_min, value);
                }
            })
        })

        this.score += this.board.sweep();
        this.events.emit('score', this.score);
        this.events.emit('board', this.board);
        this.block = this.nextBlock;
        // reset the board if there is no space for the new block
        if (this.isCollision(this.block)) {
            console.log("game over");
            this.gameOver(this.score);
            this.events.emit("gameOver", this.score);
            return;
        } else {
            this.nextBlock = this.resetBlock(); 
            this.drawer.drawBlocks();
            this.events.emit('block', this.block);
        }
    }

    // rotate the block
    rotateBlock(dir) {
        // save original position in case rotation is not possible
        const coord = this.block.getCoordinates();
        let offset = 1;
        this.block.rotate(dir);
        // try to move left/right to avoid collision
        while(this.isCollision(this.block)) {
            this.block.move(offset, true);
            offset = -(offset + (offset > 0 ? 0 : -1));
            // if we are too far and there is no sucess,
            // don't rotate
            if (offset > (coord.x_max - coord.x_min)) {
                this.block.rotate(-dir);
                this.block.pos.x = coord.x_min;
                this.block.pos.y = coord.y_min;
                return;
            }
        }
        this.events.emit('block', this.block);
    }

    // move the block
    moveBlock(dir, isX) {
        this.block.move(dir, isX);
        // if it is a vertical movement, we reset the drop counter
        if (!isX) {
            this.dropCounter = 0;
        }
        // if there is a collision, revert the movement
        if (this.isCollision(this.block)) {
            this.block.move(-dir, isX);
            // if we can't move down, we want to place the block
            if (!isX) {
                this.place();
                return;
            }
        } else {
            this.events.emit('block', this.block);
        }
    }

    // drop the block
    drop() {
        while (!this.isCollision(this.block)) {
            this.block.move(+1, false);
        }
        this.block.move(-1, false);
        this.place();
        this.dropCounter = 0;
    }

    // reset the board and get a new block
    reset() {
        this.board.clear(); 
        this.events.emit('board', this.board);
        this.block = this.resetBlock();
        this.events.emit('block', this.block);
        this.score = 0;
        this.events.emit('score', this.score);
        this.dropInterval = 1000;
        this.heldBlock = null;
        this.nextBlock = this.resetBlock();
        this.drawer.drawBlocks();
        this.events.emit('heldBlock', this.heldBlock);
        this.events.emit('nextBlock', this.nextBlock);
    }

    // holds the current block
    hold() {
        // if there is a currently held block,
        // then substitute that one in
        if (this.heldBlock != null) {
            const coord = this.block.getCoordinates();
            this.heldBlock.pos.x = coord.x_min;
            this.heldBlock.pos.y = coord.y_min;
            // if there is no collision, allow substitution
            if (!this.isCollision(this.heldBlock)) {
                const tempBlock = this.block;
                this.block = this.heldBlock;
                this.heldBlock = tempBlock;
            }
        } else { // otherwise, hold the current block and use the next block
            const coord = this.block.getCoordinates();
            this.nextBlock.pos.x = coord.x_min;
            this.nextBlock.pos.y = coord.y_min;
            if (!this.isCollision(this.nextBlock)) {
                const tempBlock = this.block;
                this.block = this.nextBlock;
                this.nextBlock = this.resetBlock();
                this.heldBlock = tempBlock;
            }
        }
        this.heldBlock.pos.x = 0;
        this.heldBlock.pos.y = 0;
        this.drawer.drawBlocks();
        this.events.emit('block', this.block);
        this.events.emit('heldBlock', this.heldBlock);
        this.events.emit('nextBlock', this.nextBlock);
    }

    // get the position of a shadow block
    getShadowBlock() {
        var shadowBlock = new Block();
        // copy the matrix
        shadowBlock.matrix = this.block.matrix.map(function(arr) {
            return arr.slice();
        });
        shadowBlock.matrix.forEach((row,y) => {
            row.forEach((val,x)=> {
                if (val != 0) {
                    shadowBlock.matrix[y][x] = 8;
                };
            });
        });
        shadowBlock.pos = Object.assign(shadowBlock.pos, this.block.pos);
        while (!this.isCollision(shadowBlock)) {
            shadowBlock.pos.y ++;
        }  
          
        // adjust block to last valid position
        shadowBlock.pos.y --;  
        if (shadowBlock.pos.y == this.block.pos.y) {
            // we don't want to paint on top of current block
            return null;
        }
        return shadowBlock;
    }

    // speed up by 10%
    speedUp() {
        this.dropInterval *= 0.5;
        console.log(this.dropInterval);
    }

    // slow down by 10%
    slowDown() {
        this.dropInterval *= 1.5;
        console.log(this.dropInterval);
    }
}

