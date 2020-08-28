class Client {
    constructor(conn) {
        this.conn = conn;
        this.room = null;
        this.name = "";
    }

    // send msg to client
    send(msg) {
        // use call back to ensure that message was received by the client
        this.conn.send(JSON.stringify(msg), function ack(err) {
            console.log("ack");
            if (err) {
                console.error('Message failed', msg, err);
            }
        })
    }
}

module.exports = Client;