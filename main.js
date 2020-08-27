const playerManager = new PlayerManager(document);
const connManager = new connManager();
connManager.connect('ws://localhost:9000');

const localPlayer = playerManager.addPlayer();
const controller = new Controller(document, localPlayer);
localPlayer.run();