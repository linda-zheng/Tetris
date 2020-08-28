class ConnManager {
    constructor(document, playerManager) {
        this.conn = null;
        this.document = document;
        //this.name = "";
        this.peers = new Map;
        this.playerManager = playerManager;
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
        console.log(msg);
        const data = JSON.parse(msg);
        if (data.type == 'broadcast-join') {
            this.updatePlayerManager(data.peers);
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
        }
        //self.name = name;
        self.document.getElementById('block').classList.add('small');
        const localPlayer = self.playerManager.addPlayer();
        localPlayer.element.querySelector('.tetris').classList.add('local');
        const controller = new Controller(document, localPlayer);
        localPlayer.run();
    }

}