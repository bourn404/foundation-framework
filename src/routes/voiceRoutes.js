const express = require('express');

module.exports = function(io) {

    const voiceController = require('../controllers/voiceController.js')(io);

    let router = express.Router();

    // base url: /voice

    router.post('/', voiceController.handleIncomingCalls);
    router.post('/status', voiceController.callStatusChange);
    router.post('/answer', voiceController.clientAnswerCall);
    router.post('/route', voiceController.routeCallToClient);
    router.get('/token', voiceController.generateClientAccessToken)
    router.post('/end', voiceController.endCall);

    return router;
};