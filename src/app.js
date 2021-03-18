require('dotenv').config();
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const { logger, stream } = require('./logger');
const morgan = require('morgan');

// Configure Server
logger.log({ level: 'debug', message: 'Setting up server.' });
const app = express();
const port = process.env.PORT || 3000;
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Access log
app.use(morgan("combined", { "stream": stream }));

// Parse request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, './views');
const partialsPath = path.join(__dirname, './views/partials');
app.use(express.static(publicDirectoryPath));

// Setup handlebars engine and views location
logger.log({ level: 'debug', message: 'Setting up view engine.' });
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

// Routes 
logger.log({ level: 'debug', message: 'Setting up routes.' });
const voiceRoutes = require('./routes/voiceRoutes');
const publicRoutes = require('./routes/publicRoutes');
app.use("/voice", voiceRoutes(io));
app.use("/", publicRoutes(io, app));

// Start Server
server.listen(port, () => {
    logger.log({ level: 'info', message: 'Server is running on port ' + port + '.' });
});

// Socket.io Connections
io.on('connection', (client) => {
    logger.log({ level: 'http', message: 'Socket connection on port ' + port + '.' });
});

// Update TWIML app with current site root address
// In the future when you're not using a trial twilio account, you would probably set up a separate phone number and a separate app for dev purposes
// This will also cause problems if you have multiple devs, but since it's just me we're alright!
twilio.applications('AP8782bacb9fb3bad392e37740a7e77292')
    .update({
        voiceUrl: process.env.SITE_ROOT + '/voice',
        statusCallback: process.env.SITE_ROOT + '/voice/status'
    })
    .then(application => logger.log({ level: 'debug', message: '"' + application.friendlyName + '" TwiML App updated to ' + process.env.SITE_ROOT }));