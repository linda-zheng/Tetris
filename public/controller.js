class Controller {
    constructor(document, player) {
        this.cmdIdx = {
            "left": 0,
            "right": 1,
            "down": 2,
            "drop": 3,
            "cw": 4,
            "ccw": 5,
            "reset": 6,
            "hold": 7,
        };
        this.cmdOrder = ["left", "right", "down", "drop", "cw", "ccw", "reset", "hold"]
        this.cmdKeyCode = [37,39,40,13,38,67,82,32];

        this.document = document
        this.player = player
        
        // event listener for left/right/down movement
        this.document.addEventListener('keydown', event => {
            if (event.keyCode == this.cmdKeyCode[this.cmdIdx["left"]]) {
                this.player.moveBlock(-1, true);
            } else if (event.keyCode == this.cmdKeyCode[this.cmdIdx["right"]]) {
                this.player.moveBlock(+1, true);
            } else if (event.keyCode == this.cmdKeyCode[this.cmdIdx["down"]]) {
                this.player.moveBlock(+1, false);
            } else if (event.keyCode == this.cmdKeyCode[this.cmdIdx["ccw"]]) {
                this.player.rotateBlock(-1, true);
            } else if (event.keyCode == this.cmdKeyCode[this.cmdIdx["cw"]]) {
                this.player.rotateBlock(+1, true);
            } else if (event.keyCode == this.cmdKeyCode[this.cmdIdx["drop"]]) {
                this.player.drop();
            } else if (event.keyCode == this.cmdKeyCode[this.cmdIdx["reset"]]) {
                this.player.reset();
            } else if (event.keyCode == this.cmdKeyCode[this.cmdIdx["hold"]]) {
                this.player.hold();
            }
        })

        this.displayCmd();
    }

    // display text for commands
    displayCmd() {
        var cmdText = "Commands \n";
        for (let i = 0; i < this.cmdOrder.length; ++i) {
            cmdText += this.cmdOrder[i] + ": ";
            cmdText += keyboardMap[this.cmdKeyCode[this.cmdIdx[this.cmdOrder[i]]]];
            cmdText += "\n";
        }
        this.document.getElementById('commands').innerText = cmdText;
    }
}