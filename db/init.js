
async function db_init() {
    const create_db = require("./db_create");
    const seed_db = require("./db_seed");

    await create_db();
    await seed_db();
}

db_init();