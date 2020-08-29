class PlayerManager {
    constructor(document) {
        this.document = document;
        this.template = this.document.querySelector('#player-template');
        this.instances = new Set;
    }

    // add a new player
    // returns the controller for that player
    addPlayer(isLocal = false) {
        // create new element for new player
        // true = deep import
        const element = this.document
            .importNode(this.template.content, true)
            .children[0];
        if (isLocal) {
            this.localTemplate = element.querySelector('#player-blocks-template');
            const subelement = this.document
            .importNode(this.localTemplate.content, true)
            .children[0];
            element.appendChild(subelement);
        }
        
        const player = new Player(element, isLocal);
        // add new element to browser
        this.document.body.appendChild(element);
        // add new player to instances
        this.instances.add(player);
        return player;
    }

    // remove a player
    removePlayer(player) {
        this.instances.delete(player);
        this.document.body.removeChild(player.element);
    }
}