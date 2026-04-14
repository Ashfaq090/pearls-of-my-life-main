import { DB_CONFIG } from "src/common/config/db.config";

const connection = DB_CONFIG;
export const databaseConfig = {
    development: connection,
    test: connection,
    production: connection,
};
module.exports = databaseConfig;