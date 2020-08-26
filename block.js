export function BlockFactory() {
    this.createBlock = function(type) {
        var block;
        block.pos = {x: 0, y: 0};
        if (type == 'T') {
            block = new TBlock();
        } else {
            block = new TBlock();
        }
        return block;
    }
}

var TBlock = function () {
    this.matrix = [
        [0,0,0],
        [1,1,1],
        [0,1,0],
    ];
}