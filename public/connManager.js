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
            this.updatePlayerComponent(data.senderID, data.data);
        } else if (data.type == 'serialized-state') {
            this.updatePlayer(data.peerID, data.state);
        }
    }

    // update entire state of a given player
    updatePlayer(id, state) {
        if (!this.peers.has(id)) {
            console.error("Client does not exist", id);
            return;
        }
        const player = this.peers.get(id);
        this.unserialize(state, player);
    }

    // update part of a given player
    updatePlayerComponent(id, data) {
        if (!this.peers.has(id)) {
            console.error("Client does not exist", id);
            return;
        }
        const player = this.peers.get(id);
        if (data.prop == 'score') {
            player.score = data.value;
            player.drawer.updateScore(data.value);
        } else if (data.prop == 'block' || data.prop == 'board'){
            player[data.prop] = Object.assign(player[data.prop], data.value);
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
        const name = self.document.getElementById('nameInput').value;
        // check that fields are valid
        if (room == "") {
            self.document.getElementById('roomInput').value = "invalid room";
        } 
        if (name == "") {
            self.document.getElementById('nameInput').value = "invalid name";
        }
        
        if (room !== "" && name !== "") {
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
            self.localPlayer = self.playerManager.addPlayer(name, true);
            self.localPlayer.element.querySelector('.tetris').classList.add('local');
            self.watchEvents();
            self.controller = new Controller(document, self.localPlayer);
            self.localPlayer.run();

            // send serialized state to server
            self.send({
                type: 'join-room',
                id:room,
                state: self.serialize(self.localPlayer),
            })
        }
    }

    // watch and send events to server
    watchEvents() {
        const localPlayer = this.localPlayer;
        ['board', 'score', 'block', 'heldBlock', 'nextBlock'].forEach(prop => {
            localPlayer.events.listen(prop, () => {
                this.send({
                    type: 'state-update',
                    player: {prop: prop, value: localPlayer[prop]},
                });
            });
        });
    }

    // serialize player state
    serialize(player) {
        return {
            block: {
                matrix: player.block.matrix,
                pos: player.block.pos,
            },
            board: {
                matrix: player.board.matrix,
                w: player.board.w,
                h: player.board.h,
            },
            score: player.score,
            name: player.name,
        };
        // don't need to send held block because it is initially null
    }

    // unserialize and update player state
    unserialize(state, player) {
        player.block = Object.assign(player.block, state.block);
        player.board = Object.assign(player.board, state.board);
        player.score = state.score;
        player.name = state.name;
        player.drawer.updateScore(player.score);
        player.drawer.draw();
        player.drawer.drawName();
    }
}