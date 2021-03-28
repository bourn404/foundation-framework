const db = require('./db');

const getUsers = (callback) => {
    db.query('SELECT * FROM users', [], (error, result) => {
        callback(error,result);
    });
}

const addContact = (firstname, lastname, phone, callback) => {
    phone = '+'+phone.replace(/\D/g,'');
    db.query('INSERT INTO users (firstname, lastname, phone, is_contact) VALUES ($1, $2, $3, true)',[firstname, lastname, phone],(error,result)=>{callback(error,result)});
}

module.exports = { getUsers, addContact };