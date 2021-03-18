// twilio libraries
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const { logger } = require('../logger');
const Calls = require('../models/Calls');

// require models

module.exports = function(io) {

    const handleIncomingCalls = (req, res) => {
        // TODO: Someday, you'll want to check the 'to' phone number to determine the right organization to route the call to.
        logger.log({ level: 'debug', message: req.body.Direction + ' call from ' + req.body.From + ' status: ' + req.body.CallStatus })
        const twiml = new VoiceResponse();
        io.emit('callComing', { data: req.body });
        callData = { uid: req.body.CallSid, fromNumber: req.body.From, toNumber: req.body.To, duration: 0 };
        Calls.add(callData, (err, res) => {
            if (err) return console.log(err);
            // console.log(res);
        });
        twiml.say({ voice: 'man' }, 'Please hold while we connect your call.');
        twiml.play({}, 'http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3'); // give our representatives a chance to pick up
        twiml.say({ voice: 'man' }, 'No representatives are available.  After the tone, please leave your name and a brief message. We\'ll call you back as soon as possible.');
        twiml.pause({ length: 1 });
        twiml.record({ timeout: 5, transcribe: true, playBeep: true, action: process.env.SITE_ROOT + '/voice/end' });
        twiml.hangup();
        res.send(twiml.toString());
    }

    const callStatusChange = (req, res) => {
        switch (req.body.CallStatus) {
            case 'completed':

                // Update call status in database
                let newStatus = 'unknown';
                Calls.getStatus(req.body.CallSid, (err, result) => {
                    if (err) logger.log({ level: 'error', message: err });
                    // check whether or not the call was answered
                    switch (result) {
                        case 'in-progress':
                            newStatus = 'complete';
                            break;
                        case 'ringing':
                            newStatus = 'missed'
                            break;
                    }
                    Calls.updateStatus({ uid: req.body.CallSid, status: newStatus }, (err, result) => {
                        if (err) logger.log({ level: 'error', message: err });
                    });
                    req.body.CallStatus = newStatus;
                    logger.log({ level: 'debug', message: req.body.Direction + ' call from ' + req.body.From + ' status: ' + req.body.CallStatus });
                    io.emit('callComplete', { data: req.body });
                });

                callData = { uid: req.body.CallSid, duration: req.body.CallDuration };
                Calls.updateDuration(callData, (err, result) => {
                    res.status(200).send();
                    if (err) return console.log(err);
                });
                break;
            default:
                console.log(req.body);
                break;
        }
    }

    const endCall = (req, res) => {
        const twiml = new VoiceResponse();
        twiml.hangup();
        res.send(twiml.toString());
    }

    const clientAnswerCall = (req, res) => {
        logger.log({ level: 'debug', message: '"' + req.body.clientIdentity + '" answered call: ' + req.body.id });
        Calls.updateStatus({ uid: req.body.id, status: 'in-progress' }, (err, result) => {
            if (err) logger.log({ level: 'error', message: err });
        });
        twilio.calls(req.body.id)
            .update({
                url: process.env.SITE_ROOT + '/voice/route/' + req.body.clientIdentity,
                method: 'POST'
            }, (err, call) => {
                if (err) {
                    logger.log({ level: 'error', message: err })
                }
            });
    }

    const routeCallToClient = (req, res) => {
        const twiml = new VoiceResponse();
        twiml.dial().client(req.params.client);
        res.type('text/xml');
        res.send(twiml.toString());
    }

    const generateClientAccessToken = (req, res) => {
        const clientIdentity = 'agent'; // TODO: Make this dynamic depending on who is logged in

        const voiceGrant = new VoiceGrant({
            outgoingTWILIO_APP_SID: process.env.TWILIO_APP_SID,
            incomingAllow: true,
        })

        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_APP_API_SID,
            process.env.TWILIO_APP_API_SECRET, { identity: clientIdentity }
        );
        token.addGrant(voiceGrant);
        token.identity = clientIdentity;

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ token: token.toJwt(), clientIdentity: clientIdentity }));
    }


    return {
        handleIncomingCalls,
        callStatusChange,
        endCall,
        clientAnswerCall,
        routeCallToClient,
        generateClientAccessToken
    }

}