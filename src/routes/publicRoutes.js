const path = require('path');
const express = require('express');

module.exports = function(io, app) {

    let router = express.Router();

    // Make client sdks available to frontend
    app.use('/js/twilio.min.js', (req, res) => {
        res.sendFile(path.join(__dirname, '../../node_modules/twilio-client/dist/twilio.min.js'));
    })
    app.use('/js/axios.min.js', (req, res) => {
        res.sendFile(path.join(__dirname, '../../node_modules/axios/dist/axios.min.js'));
    })

    const publicController = require('../controllers/publicController.js')(io);

    // base url: /

    router.get('', publicController.getPublicHomepage)
    router.get('*', publicController.get404ErrorPage)

    return router;
};