const player = new Player(document);


const cmdIdx = {
    "left": 0,
    "right": 1,
    "down": 2,
    "drop": 3,
    "cw": 4,
    "ccw": 5,
    "reset": 6,
};
const cmdOrder = ["left", "right", "down", "drop", "cw", "ccw", "reset"]
var cmdKeyCode = [37,39,40,32,38,67,82];

// event listener for left/right/down movement
document.addEventListener('keydown', event => {
    if (event.keyCode == cmdKeyCode[cmdIdx["left"]]) {
        player.moveBlock(-1, true);
    } else if (event.keyCode == cmdKeyCode[cmdIdx["right"]]) {
        player.moveBlock(+1, true);
    } else if (event.keyCode == cmdKeyCode[cmdIdx["down"]]) {
        player.moveBlock(+1, false);
    } else if (event.keyCode == cmdKeyCode[cmdIdx["ccw"]]) {
        player.rotateBlock(-1, true);
    } else if (event.keyCode == cmdKeyCode[cmdIdx["cw"]]) {
        player.rotateBlock(+1, true);
    } else if (event.keyCode == cmdKeyCode[cmdIdx["drop"]]) {
        player.drop();
    }
    // TODO: reset command
})

var cmdText = "Commands \n";
for (let i = 0; i < cmdOrder.length; ++i) {
    cmdText += cmdOrder[i] + ": ";
    cmdText += keyboardMap[cmdKeyCode[cmdIdx[cmdOrder[i]]]];
    cmdText += "\n";
}
document.getElementById('commands').innerText = cmdText;