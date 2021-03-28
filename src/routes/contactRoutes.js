const express = require('express');

module.exports = function(io) {

    const contactController = require('../controllers/contactController.js')(io);

    let router = express.Router();

    // base url: /contact

    router.post('/add', contactController.add);
    router.get('/all', contactController.getAll);

    return router;
};