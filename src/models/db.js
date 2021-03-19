const { Pool } = require('pg')
const { requestLogger } = require('../logger');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
})
module.exports = {
    query: (text, params, callback) => {
        const start = Date.now()
        return pool.query(text, params, (err, res) => {
            const duration = Date.now() - start;
            requestLogger.log({ level: 'info', message: 'executed query: ' + JSON.stringify({ text, duration }) });
            callback(err, res)
        })
    },
}