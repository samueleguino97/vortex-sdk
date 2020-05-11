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
  }

  async _interact(collection, params) {
    const urlToInteract =
      `${this.crudUrl}/${collection}` + (params.extraUrl || "");

    const response = await fetch(urlToInteract, params);
    const data = await response.json();
    return data;
  }

  listen(dbPath = "", callback, query = {}) {
    const socket = new WebSocket("ws://localhost:8080");

    socket.addEventListener("ping", heartbeat);
    socket.addEventListener("close", function clear() {
      clearTimeout(this.pingTimeout);
    });

    socket.addEventListener("open", (params) => {
      heartbeat(params);
      socket.send(JSON.stringify({ collection: dbPath, type: "SUBSCRIBE" }));
      socket.addEventListener("message", (message) => {
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

  get(dbPath = "", query = {}) {
    return this._interact(dbPath, { method: "GET", ...query });
  }

  create(collection, data) {
    return this._interact(collection, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
  }
}

module.exports = VortexDB;
