class ConnManager {
    constructor(document) {
        this.conn = null;
        this.document = document;
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
        if (data.type == 'room-joined') {
            window.location.hash = data.id;
        }
    }

    // send data using JSON format
    send(data) {
        const msg = JSON.stringify(data);
        this.conn.send(msg);
    }

    // join a room
    join(self) {
        const room = self.document.getElementById('roomInput').value;
        const name = self.document.getElementById('nameInput').value;
        if (room == "") {
            self.document.getElementById('roomInput').value = "invalid room";
        } 
        if (name == "") {
            self.document.getElementById('nameInput').value = "invalid name";
        } 
        
        if (room !== "" && name !== "") {
            self.send({type: 'join-room', id: room, name: name});
        }

        self.document.getElementById('block').classList.add('smallBlock');
    }

}