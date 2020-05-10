const VortexDB = require("./db");

class Vortex {
  constructor() {
    this.DB_URL = "http://127.0.0.1:8080";

    this.db = new VortexDB(this.DB_URL);
  }
  init(config = {}) {
    this.DB_URL = config.db;
  }
}
const vortex = new Vortex();
vortex.db.listen("bis", (data) => {
  console.log(data);
});
module.exports = vortex;
