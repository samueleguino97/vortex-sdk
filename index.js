const VortexDB = require('./db');

class Vortex {
	constructor() {
		this.DB_URL = 'http://127.0.0.1:8080';

		this.db = new VortexDB(this.DB_URL);
	}
	init(config = {}) {
		this.db._init(config.db, config.dbRT);
	}
}
const vortex = new Vortex();

module.exports = vortex;
