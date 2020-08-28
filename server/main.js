const WebSocketServer =  require('ws').Server;
const server = new WebSocketServer({port: 9000});

const Room = require('./room');
const Client = require('./client');

const rooms = new Map;

server.on('connection', conn => {
    console.log('Connection established');
    const client = new Client(conn);

    conn.on('close', () => {
        console.log('Connection closed');
        const room = client.room;
        if (room) {
            room.leave(client);
            if (room.clients.size === 0) {
                rooms.delete(room.id);
            }
        }
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
            console.log(rooms);
        }
        
    })
})