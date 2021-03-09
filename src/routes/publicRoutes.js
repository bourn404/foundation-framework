const express = require('express');

module.exports = function(io, app) {

    let router = express.Router();

    // Make client sdks available to frontend
    app.use('/js/twilio.min.js', (req, res) => {
        res.sendFile(path.join(__dirname, '../node_modules/twilio-client/dist/twilio.min.js'));
    })
    app.use('/js/axios.min.js', (req, res) => {
        res.sendFile(path.join(__dirname, '../node_modules/axios/dist/axios.min.js'));
    })

    // base url: /

    const appName = "Foundation Framework";
    const author = "Carson Fairbourn";

    router.get('', (req, res) => {
        res.render('index', {
            appName,
            author,
            pageTitle: 'Home',
        });
    })

    router.get('*', (req, res) => {
        res.status(404).render('404', {
            appName,
            author,
            pageTitle: 'Error 404: Page Not Found'
        });
    })

    return router;
};