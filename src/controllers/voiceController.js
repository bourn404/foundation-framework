// twilio libraries
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

// require models

module.exports = function(io) {

    const handleIncomingCalls = (req, res) => {
        // TODO: Someday, you'll want to check the 'to' phone number to determine the right organization to route the call to.
        // console.log(chalk.yellow(req.body.Direction + ' call from ' + req.body.From + ' status: ' + req.body.CallStatus));
        const twiml = new VoiceResponse();
        io.emit('callComing', { data: req.body });
        twiml.pause({ length: 15 }); // give our representatives a chance to pick up
        twiml.say({ voice: 'man' }, 'Thanks for calling Foundation Framework.  After the tone, please leave your name and a brief message. We\'ll call you back as soon as possible.');
        twiml.pause({ length: 1 });
        twiml.record({ timeout: 5, transcribe: true, playBeep: true, action: process.env.SITE_ROOT + '/voice/end' });
        twiml.hangup();
        res.send(twiml.toString());
    }

    const callStatusChange = (req, res) => {
        // console.log(req.body);
    }

    const endCall = (req, res) => {
        const twiml = new VoiceResponse();
        twiml.hangup();
        res.send(twiml.toString());
    }

    const clientAnswerCall = (req, res) => {
        twilio.calls(req.body.id)
            .update({
                url: process.env.SITE_ROOT + '/voice/route', // TODO: Add a post parameter that specifies which 'agent' answered the call
                method: 'POST'
            }, (err, call) => {
                if (err) {
                    console.log(chalk.red(err));
                }
            });
    }

    const routeCallToClient = (req, res) => {
        const twiml = new VoiceResponse();
        twiml.dial().client('agent'); // TODO: Make 'agent' a dynamic string depending on who answers the call
        res.type('text/xml');
        res.send(twiml.toString());
    }

    const generateClientAccessToken = (req, res) => {
        const identity = 'agent'; // TODO: Make this dynamic depending on who is logged in

        const voiceGrant = new VoiceGrant({
            outgoingTWILIO_APP_SID: process.env.TWILIO_APP_SID,
            incomingAllow: true,
        })

        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_APP_API_SID,
            process.env.TWILIO_APP_API_SECRET, { identity: identity }
        );
        token.addGrant(voiceGrant);
        token.identity = identity;

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ token: token.toJwt() }));
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