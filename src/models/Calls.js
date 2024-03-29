const db = require('./db');

const getAll = (callback) => {
    db.query('SELECT id, uid, status, duration, notes, recording, created, CONCAT(SUBSTRING(from_number, 1, 8), \'9999\') AS from_number, to_number FROM calls', [], (error, result) => {
        callback(error, result);
    });
}

const getRecent = (count, callback) => {
    if (!Number.isInteger(count)) return callback('Invalid paremeter in getRecent', null);
    let sql = "SELECT calls.id, calls.uid, calls.status, calls.duration, calls.notes, calls.recording, calls.created, CONCAT(SUBSTRING(calls.from_number, 1, 8), '9999') AS from_number, to_number, users.id as from_user, CONCAT(users.firstname, ' ', users.lastname) as from_name FROM calls LEFT JOIN users on users.phone = calls.from_number ORDER BY created DESC LIMIT $1"
    db.query(sql, [count], (error, result) => {
        callback(error, result);
    });
}

const getStatus = (uid, callback) => {
    const sql = "SELECT status FROM calls WHERE uid = $1";
    if (!uid) {
        return callback('Invalid parameter in getStatus', null);
    }
    db.query(sql, [uid], (error, result) => {
        if (result.rowCount == 1) {
            callback(error, result.rows[0].status);
        } else {
            callback('Error: Call not found', null);
        }

    });
}

const add = ({ uid, fromNumber, fromUser, toNumber, toUser, duration, notes }, callback) => {
    const sql = "INSERT INTO calls(uid,from_number,from_user,to_number,to_user,duration,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)";
    const data = [uid || null, fromNumber || null, fromUser || null, toNumber || null, toUser || null, duration || 0, notes || null];
    db.query(sql, data, (error, result) => {
        callback(error, result);
    });
}

const updateStatus = ({ uid, status }, callback) => {
    const sql = "UPDATE calls SET status = $2 WHERE uid = $1";
    if (!uid || !status) {
        return callback('Invalid parameter in updateStatus', null);
    }
    const data = [uid, status];
    db.query(sql, data, (error, result) => {
        callback(error, result);
    });
}

const updateDuration = ({ uid, duration }, callback) => {
    const sql = "UPDATE calls SET duration = $2 WHERE uid = $1";
    if (!uid || isNaN(duration)) {
        return callback('Invalid parameter in updateDuration', null);
    }
    const data = [uid, duration];
    db.query(sql, data, (error, result) => {
        callback(error, result);
    });
}

module.exports = { getAll, getRecent, getStatus, add, updateStatus, updateDuration };