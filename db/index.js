function heartbeat() {
	clearTimeout(this.pingTimeout);

	// Use `WebSocket#terminate()`, which immediately destroys the connection,
	// instead of `WebSocket#close()`, which waits for the close timer.
	// Delay should be equal to the interval at which your server
	// sends out pings plus a conservative assumption of the latency.
	this.pingTimeout = setTimeout(() => {
		this.terminate();
	}, 30000 + 1000);
}
class VortexDB {
	constructor(databaseUrl) {
		this.baseUrl = databaseUrl;
		this.crudUrl = `${databaseUrl}/crud`;
		this.socketUrl = 'ws://localhost:8080';
	}

	_init(dbPath, socketUrl) {
		this.baseUrl = dbPath;
		this.crudUrl = `${dbPath}/crud`;
		this.socketUrl = socketUrl;
	}

	async _interact(collection, params) {
		const urlToInteract = `${this.crudUrl}/${collection}` + (params.extraUrl || '');

		const response = await fetch(urlToInteract, params);
		const data = await response.json();
		return data;
	}

	listen(dbPath = '', callback, query = {}) {
		const socket = new WebSocket(this.socketUrl);

		socket.addEventListener('ping', heartbeat);
		socket.addEventListener('close', function clear() {
			clearTimeout(this.pingTimeout);
		});

		socket.addEventListener('open', (params) => {
			heartbeat(params);
			socket.send(JSON.stringify({ collection: dbPath, type: 'SUBSCRIBE' }));
			socket.addEventListener('message', (message) => {
				if (callback) {
					callback(JSON.parse(message.data));
				}
			});
		});
		return () => {
			socket.close();
		};
	}

	listCollections() {
		return fetch(`${this.baseUrl}/listCollections`).then((res) => res.json());
	}

	get(dbPath = '', query = {}) {
		return this._interact(dbPath, { method: 'GET', ...query });
	}

	create(collection, data) {
		return this._interact(collection, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: { 'Content-Type': 'application/json' }
		});
	}

	update(collection, documentId, data) {
		return this._interact(collection, {
			method: 'PUT',
			body: JSON.stringify({ data, id: documentId }),
			headers: { 'Content-Type': 'application/json' }
		});
	}
	delete(collection, documentId) {
		return this._interact(collection, {
			method: 'DELETE',
			extraUrl: '?id=' + documentId
		});
	}

	createCollection(collection) {
		return fetch(`${this.baseUrl}/createCollection?collection=${collection}`).then((res) => res.json());
	}
}

module.exports = VortexDB;
