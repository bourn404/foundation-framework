// require('dotenv').config();
const VoiceResponse = require('twilio').twiml.VoiceResponse

const receiveCall = (callback) => {
    const twiml = new VoiceResponse();
    twiml.say('Thank you for calling Foundation Framework.  Please hold while we connect you.');
    const dial = twiml.dial();
    dial.conference('ff1234');
    callback(undefined,twiml.toString());
}

module.exports = receiveCall;