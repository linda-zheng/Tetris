class ConnManager {
    constructor(document, playerManager) {
        this.conn = null;
        this.document = document;
        //this.name = "";
        this.peers = new Map;
        this.playerManager = playerManager;
        this.localPlayer = null;
        this.controller = null;
    }

    // connect to a given address
    connect(address)
    {
        this.conn = new WebSocket(address);
        this.conn.addEventListener('open', () => {
            console.log('Connection established');
        })

        this.conn.addEventListener('message', event => {
            this.receive(event.data);
        })
        
        var self = this;
        this.document.getElementById('joinBtn').addEventListener("click", self.join.bind(null, self));
    }

    // receive and parse JSON data
    receive(msg) {
        const data = JSON.parse(msg);
        if (data.type == 'broadcast-join') {
            this.updatePlayerManager(data.peers);
        } else if (data.type == 'broadcast-state') {
            this.updatePlayer(data.senderID, data.data);
        }
    }

    // update the state of a given player
    updatePlayer(id, data) {
        if (!this.peers.has(id)) {
            console.error("Client does not exist", id);
            return;
        }
        const player = this.peers.get(id);
        if (data.prop == 'score') {
            player.score = data.value;
            player.drawer.updateScore(data.value);
        } else {
            if (data.prop == 'block') {
                player.block.pos = data.value.pos;
                player.block.matrix = data.value.matrix;
            } else if (data.prop == 'board') {
                player.board.matrix = data.value.matrix;
            }
            player.drawer.draw();
        }
    }

    // update the player manager to keep track of current players
    updatePlayerManager(peers) {
        const me = peers.you;
        const clients = peers.clients.filter(id => me !== id);
        // check for new players
        clients.forEach(id => {
            if (!this.peers.has(id)){
                const player = this.playerManager.addPlayer();
                this.peers.set(id, player);
            }
        });
        // remove non existent players
        [...this.peers.entries()].forEach(([id, player]) => {
            if (clients.indexOf(id) === -1) {
                this.playerManager.removePlayer(player);
                this.peers.delete(id);
            }
        })
    }

    // send data using JSON format
    send(data) {
        const msg = JSON.stringify(data);
        this.conn.send(msg);
    }

    // join a room
    // use self to pass the current instance of connection manager
    join(self) {
        const room = self.document.getElementById('roomInput').value;
        //const name = self.document.getElementById('nameInput').value;
        // check that fields are valid
        if (room == "") {
            self.document.getElementById('roomInput').value = "invalid room";
        } 
        /*if (name == "") {
            self.document.getElementById('nameInput').value = "invalid name";
        }*/
        
        if (room !== "") { // && name !== ""
            self.send({type: 'join-room', id: room});
            //self.send({type: 'join-room', id: room, name: name});

            // delete all current games on the screen
            if (self.localPlayer) {
                self.playerManager.removePlayer(self.localPlayer);
            }
            [...self.peers.entries()].forEach(([id, player]) => {
                self.playerManager.removePlayer(player);
            })
            self.peers.clear();

            // set up local game
            self.document.getElementById('block').classList.add('small');
            self.localPlayer = self.playerManager.addPlayer();
            self.localPlayer.element.querySelector('.tetris').classList.add('local');
            self.watchEvents();
            self.controller = new Controller(document, self.localPlayer);
            self.localPlayer.run();
        }
        //self.name = name;
    }

    // watch and send events to server
    watchEvents() {
        const localPlayer = this.localPlayer;
        ['board', 'score', 'block'].forEach(prop => {
            localPlayer.events.listen(prop, () => {
                //console.log(localPlayer[prop]);
                this.send({
                    type: 'state-update',
                    player: {prop: prop, value: localPlayer[prop]},
                });
            });
        });
    }
}