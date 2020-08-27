class BlockFactory {
    constructor(boardWidth=12) {
        this.boardWidth = boardWidth;
        this.createBlock = function(type) {
            var block;
            if (type == 'T') {
                block = new TBlock(this.boardWidth);
            } else if (type == 'O') {
                block = new OBlock(this.boardWidth);
            } else if (type == 'L') {
                block = new LBlock(this.boardWidth);
            }  else if (type == 'J') {
                block = new JBlock(this.boardWidth);
            } else if (type == 'I') {
                block = new IBlock(this.boardWidth);
            } else if (type == 'S') {
                block = new SBlock(this.boardWidth);
            } else {
                block = new ZBlock(this.boardWidth);
            }
            return block;
        }
    }
}

class TBlock extends Block {
    constructor(boardWidth) {
        super();
        this.matrix = [
            [1,1,1],
            [0,1,0],
            [0,0,0],
        ];
        this.setToCenter(boardWidth);
    }
}

class OBlock extends Block {
    constructor(boardWidth) {
        super();
        this.matrix = [
            [2,2],
            [2,2],
        ];
        this.setToCenter(boardWidth);
    }
}

class LBlock extends Block {
    constructor(boardWidth) {
        super();
        this.matrix = [
            [0,3,0],
            [0,3,0],
            [0,3,3],
        ];
        this.setToCenter(boardWidth);
    }
}

class JBlock extends Block {
    constructor(boardWidth) {
        super();
        this.matrix = [
            [0,4,0],
            [0,4,0],
            [4,4,0],
        ];
        this.setToCenter(boardWidth);
    }
}

class IBlock extends Block {
    constructor(boardWidth) {
        super();
        this.matrix = [
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
        ];
        this.setToCenter(boardWidth);
    }
}

class SBlock extends Block {
    constructor(boardWidth) {
        super();
        this.matrix = [
            [0,6,6],
            [6,6,0],
            [0,0,0],
        ];
        this.setToCenter(boardWidth);
    }
}

class ZBlock extends Block {
    constructor(boardWidth) {
        super();
        this.matrix = [
            [7,7,0],
            [0,7,7],
            [0,0,0],
        ];
        this.setToCenter(boardWidth);
    }
}