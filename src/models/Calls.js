const db = require('./db');

const getCalls = (callback) => {
    db.query('SELECT * FROM calls', [], (error, result) => {
        callback(error,result);
    });
}

const addCall = (data, callback) => {
    const sql = "INSERT INTO calls(uid,from_number,from_user,to_number,to_user,duration,notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *";
    db.query(sql, data, (error, result) => {
        callback(error,result);
    });
}

module.exports = { getCalls, addCall };