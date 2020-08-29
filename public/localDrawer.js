class LocalDrawer {
    constructor(player, element, context) {
        this.player = player;
        this.canvasAll = [...element.querySelectorAll('canvas')];
        this.nextBlockCanvas = this.canvasAll[1];
        this.heldBlockCanvas = this.canvasAll[2];
        this.nextBlock = this.nextBlockCanvas.getContext('2d');
        this.heldBlock = this.heldBlockCanvas.getContext('2d');
        this.nextBlock.scale(20, 20);
        this.heldBlock.scale(20, 20);
        this.context = context;
        // colours for rectangles
        this.colours = [
            null,
            '#DCA3C2',
            '#C7CEF4',
            '#D1A69B',
            '#7894CF',
            '#9B9655',
            '#97D2E1',
            '#F5D788',
            '#202028', // colour for shadow
        ]
    }

    // draw the matrix with offset on the board
    drawMatrix(matrix, offset, context) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = this.colours[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            })
        })
    }
    
    // draw the next and held block
    drawBlocks() {
        // clear the background of the blocks 
        this.nextBlock.fillStyle = '#202028';
        this.nextBlock.fillRect(0, 0, this.nextBlockCanvas.width, this.nextBlockCanvas.height);
        this.heldBlock.fillStyle = '#202028';
        this.heldBlock.fillRect(0, 0, this.heldBlockCanvas.width, this.heldBlockCanvas.height);
        const nextBlock = this.player.nextBlock;
        if (nextBlock != null) {
            this.drawMatrix(nextBlock.getMatrix(), {x: 0, y: 0}, this.nextBlock);
        }
        const heldBlock = this.player.heldBlock;
        if (heldBlock != null) {
            this.drawMatrix(heldBlock.getMatrix(), {x: 0, y: 0}, this.heldBlock);
        }
    }

    // draw the shadow of the current block
    drawShadowBlock() {
        const block = this.player.getShadowBlock();
        if (block != null) {            
            const coord = block.getCoordinates();
            this.drawMatrix(block.getMatrix(), {x: coord.x_min, y: coord.y_min}, this.context);
        }
    }
}