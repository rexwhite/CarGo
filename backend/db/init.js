
function db_init() {
    require("./db_create");
    require("./db_seed")();
}

db_init();