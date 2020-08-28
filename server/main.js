const WebSocketServer =  require('ws').Server;
const server = new WebSocketServer({port: 9000});

const Room = require('./room');
const Client = require('./client');

const rooms = new Map;
const clients = new Set;

function broadcastJoin(room) {
    // get array of all clients in the room
    const clients = [...room.clients];
    clients.forEach(client => {
        client.send ({
            type: 'broadcast-join',
            peers: {
                you: client.id,
                clients: clients.map(client => client.id),
            }
        })
    })
}

function createUniqueID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    function createID() {
        return s4() + s4() + '-' + s4();
    }
    var id = createID();
    while (clients.has(id)) {
        id = createID();
    }
    return id;
}

server.on('connection', conn => {
    console.log('Connection established');
    const client = new Client(conn, createUniqueID());
    clients.add(client.id);

    conn.on('close', () => {
        console.log('Connection closed');
        const room = client.room;
        if (room) {
            room.leave(client);
            if (room.clients.size === 0) {
                rooms.delete(room.id);
            }
        }
        clients.delete(client.id);
        broadcastJoin(room);
        console.log(rooms);
    })

    conn.on('message', msg => {
        data = JSON.parse(msg)
        if (data.type == 'join-room') {
            client.name = data.name;
            // remove from previous room
            var oldroom = client.room;
            if (oldroom) {
                oldroom.leave(client);
                // remove old room if there are no more clients
                // otherwise, notify old room that someone has left
                if (oldroom.clients.size === 0) {
                    oldroom.delete(oldroom.id);
                } else {
                    broadcastJoin(oldroom);
                }
            }

            // join new room
            // create new room if id doesn't exist yet
            var room;
            if (!rooms.has(data.id)) {
                room = new Room(data.id);
                rooms.set(data.id, room);
            } else {
                room = rooms.get(data.id);
            }
            room.join(client);
            broadcastJoin(room);
            console.log(rooms);
        }
        
    })
})