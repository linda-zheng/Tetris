const playerManager = new PlayerManager(document);

const connManager = new ConnManager(document, playerManager);

var host = location.origin.replace(/^http/, 'ws')
connManager.connect(host);
