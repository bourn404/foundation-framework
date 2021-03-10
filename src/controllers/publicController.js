const { logger } = require('../logger');
const Users = require('../models/Users');

module.exports = function(io) {

    const appName = "Foundation Framework";
    const author = "Carson Fairbourn";

    const getPublicHomepage = (req, res) => {

        Users.getUsers((err, res) => {
            if (err) return console.log(err);
            console.log(res);
        });

        res.render('index', {
            appName,
            author,
            pageTitle: 'Home',
        });
    }

    const get404ErrorPage = (req, res) => {
        res.status(404).render('404', {
            appName,
            author,
            pageTitle: 'Error 404: Page Not Found'
        });
    }

    return {
        getPublicHomepage,
        get404ErrorPage
    }
}