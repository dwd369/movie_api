const express = require('express'),
    morgan = require('morgan');
const app = express();

app.use(express.static('public'));
app.use(morgan('common'));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

let topMovies = [
    {
        title: 'The Matrix'
    },
    {
        title: 'The Matrix Reloaded'
    },
    {
        title: 'The Matrix Revolutions'
    },
    {
        title: 'The Matrix Resurrections'
    },
    {
        title: 'Gone Girl'
    },
    {
        title: 'Inception'
    },
    {
        title: 'Tenet'
    },
    {
        title: 'Minority Report'
    },
    {
        title: 'John Wick'
    },
    {
        title: 'John Wick: Chapter 2'
    }
];

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to my book club!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

// listen for request
app.listen('8080', () => {
    console.log('Your app is listening on port 8080.');
});