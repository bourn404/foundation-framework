const { logger } = require('../logger');
const Users = require('../models/Users');

module.exports = function(io) {

    const add = (req, res) => {
        Users.addContact(req.body.firstname, req.body.lastname, req.body.phone, (err, result) => {
            if (err) return console.log(err);
            console.log(res);
            res.status(200).json({success:true});
        });
    }

    const getAll = (req, res) => {

    }

    return {
        add,
        getAll
    }
}