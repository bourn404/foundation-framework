require('dotenv').config();
const path = require('path');
const express = require('express');
const chalk = require('chalk');
const hbs = require('hbs');
const axios = require('axios');
const bodyParser = require('body-parser');

// Configure Server
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, './views');
const partialsPath = path.join(__dirname, './views/partials');

// Setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

// Routes 
const voiceRoutes = require('./routes/voiceRoutes');
app.use("/voice", voiceRoutes(io));

// Start Server
server.listen(3000, () => {
    console.log(chalk.bold.blue('Server is up on port 3000.'));
});

// Socket.io Connections
io.on('connection', (client) => {
    console.log(chalk.green('Client connected on port 3000'));
});

const appName = 'Foundation Framework';
const author = 'Carson Fairbourn';



// Define static content directory
app.use(express.static(publicDirectoryPath));

// Make client sdks available to frontend
app.use('/js/twilio.min.js', (req, res) => {
    res.sendFile(path.join(__dirname, './node_modules/twilio-client/dist/twilio.min.js'));
})
app.use('/js/axios.min.js', (req, res) => {
    res.sendFile(path.join(__dirname, './node_modules/axios/dist/axios.min.js'));
})

app.get('', (req, res) => {
    res.render('index', {
        appName,
        author,
        pageTitle: 'Home',
    });
})

app.get('*', (req, res) => {
    res.status(404).render('404', {
        appName,
        author,
        pageTitle: 'Error 404: Page Not Found'
    });
})