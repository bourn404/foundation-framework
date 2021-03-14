const db = require('./db');

const getUsers = (callback) => {
    db.query('SELECT * FROM users', [], (error, result) => {
        callback(error,result);
    });
}

module.exports = { getUsers };