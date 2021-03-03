const express = require("express");
const chalk = require('chalk');


// twilio libraries
const client = require('twilio')(process.env.accountSid, process.env.authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

module.exports = function(io) {
    let router = express.Router();

    // handle incoming calls
    router.post('/', (req, res) => {
        console.log(req);
        console.log(chalk.yellow(req.body.Direction + ' call from ' + req.body.From + ' status: ' + req.body.CallStatus));
        const twiml = new VoiceResponse();
        io.emit('callComing', { data: req.body });
        twiml.pause({ length: 3 }); // let it ring for a few seconds
        twiml.say({ voice: 'man', loop: 100 }, 'Thanks for calling Foundation Framework.');
        res.type('text/xml');
        res.send(twiml.toString());
    })

    router.post('/answer', (req, res) => {
        client.calls(req.body.id)
            .update({
                url: 'http://bc331b47eeee.ngrok.io/voice/route',
                method: 'POST'
            }, (err, call) => {
                if (err) {
                    console.log(chalk.red(err));
                }
            });
    })

    router.post('/route', (req, res) => {
        const twiml = new VoiceResponse();
        twiml.dial().client('agent');
        res.type('text/xml');
        res.send(twiml.toString());
    })

    // generate agent access token
    router.get('/token', (req, res) => {
        const identity = 'agent';

        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: process.env.applicationSid,
            incomingAllow: true,
        })

        const token = new AccessToken(
            process.env.accountSid,
            process.env.apiSid,
            process.env.apiSecret, { identity: identity }
        );
        token.addGrant(voiceGrant);
        token.identity = identity;

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ token: token.toJwt() }));
    })

    return router;
};