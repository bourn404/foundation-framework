const db = require('./db');

const getUsers = (callback) => {
    db.query('SELECT * FROM users WHERE id = $1', [1], (error, result) => {
        console.log(error);
        console.log(result);
    });
}

module.exports = { getUsers };