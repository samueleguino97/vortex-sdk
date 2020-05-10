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

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ collection: dbPath, type: "SUBSCRIBE" }));
      socket.addEventListener("message", (message) => {
        if (callback) {
          callback(JSON.parse(message));
        }
      });
    });
    return () => {
      socket.close();
    };
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
