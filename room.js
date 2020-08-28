class Room {
    constructor(id) {
        this.id = id;
        this.clients = new Set;
    }

    // add a client to the room
    join(client) {
        // throw error if client is currently in a room
        if (client.room) {
            throw new Error("Client already in a room.");
        }
        this.clients.add(client);
        client.room = this;
    }

    // remove a client from the room
    leave(client) {
        // throw error if client is not in the room
        if (client.room !== this) {
            throw new Error("Client not in this room.");
        }
        this.clients.delete(client);
        client.room = null;
    }
}

module.exports = Room;