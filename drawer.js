class Drawer {
    constructor(player, element) {
        
        this.player = player;
        this.score = element.querySelector('.score');
        this.canvas = element.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        // make everything 20 times bigger
        this.context.scale(20, 20);
              
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
        ]

        // paint the background of the tetris board
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateScore();
    }

    // start updating the display
    run() {
        // loop the update
        let lastTime = 0;
        const update = (time = 0) => {
            // keep track of time since last update
            const deltaTime = time - lastTime;
            lastTime = time;
            this.player.update(deltaTime)
            // draw the board and block
            this.draw();
            requestAnimationFrame(update);
        }
        update();
    }


    // draw the matrix with offset on the board
    drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.fillStyle = this.colours[value];
                    this.context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            })
        })
    }

    // draw the current state of the board
    draw() {
        // clear the board
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMatrix(this.player.getBoard().getMatrix(), {x: 0, y: 0});

        // draw the new block
        var block = this.player.getBlock();
        var coord = block.getCoordinates();
        this.drawMatrix(block.getMatrix(), {x: coord.x_min, y: coord.y_min});
    }

    // update the score
    updateScore() {
        this.score.innerText = "Score: "+this.player.getScore();
    }
}