// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

var path = require('path');
app.use(express.static(path.join(__dirname, '/public')));

const WebSocket = require("ws");
const webSocketServer = new WebSocket.Server({ server });

const Room = require('./room');
const Client = require('./client');

const rooms = new Map;
const clients = new Set;

// broadcast whenever the set of clients in the room changes
function broadcastJoin(room) {
    if (room == null) {
        return;
    }
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

// broadcast updated state of client to all clients in the same room
function broadcastState(sender, data) {
    // get array of all clients in the room
    const clients = [...sender.room.clients];
    clients.forEach(c => {
        // don't broadcast to yourself
        if (c === sender) { return;}
        // broadcast to all other clients
        c.send ({
            type: 'broadcast-state',
            senderID: sender.id,
            data: data,
        })
    })

    // update client state
    sender.state[data.prop] = data.value;
}

// send state of room to newly joined client
function fetchRoomState(client) {
    const clients = [...client.room.clients];
    clients.forEach(c => {
        // don't send your own state
        if (c === client) { return;}
        // send state of all other clients
        client.send ({
            type: 'serialized-state',
            peerID: c.id,
            state: c.state,
        })
    })
}

// send state of new player to all clients currently in the room
function broadcastPlayerState(client) {
    const clients = [...client.room.clients];
    clients.forEach(c => {
        // don't send your own state
        if (c === client) { return;}
        // send state of all other clients
        c.send ({
            type: 'serialized-state',
            peerID: client.id,
            state: client.state,
        })
    })
}

// generate a unique client id
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

// broadcast game over to all clients currently in the room
function broadcastGameOver(client, score) {
    client.state.score = score;
    const clients = [...client.room.clients];
    clients.forEach(c => {
        // don't send your own state
        if (c === client) { return;}
        // send state of all other clients
        c.send ({
            type: 'game-over',
            peerID: client.id,
            score: score,
        })
    })
    client.isGameOver = true;
}

webSocketServer.on('connection', conn => {
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
            client.state = data.state;
            // remove from previous room
            var oldroom = client.room;
            if (oldroom) {
                oldroom.leave(client);
                // remove old room if there are no more clients
                // otherwise, notify old room that someone has left
                if (oldroom.clients.size === 0) {
                    rooms.delete(oldroom.id);
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
            fetchRoomState(client);
            broadcastPlayerState(client);
            console.log(rooms);
        } else if (data.type == 'state-update') {
            broadcastState(client, data.player);
        } else if (data.type == 'game-over') {
            broadcastGameOver(client, data.score);
        }
        
    })
})