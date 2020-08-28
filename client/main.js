const playerManager = new PlayerManager(document);

const connManager = new ConnManager(document, playerManager);
connManager.connect('ws://localhost:9000');
