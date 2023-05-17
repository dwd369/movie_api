// initialize modules
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    uuid = require('uuid'),
    Models = require('./model.js'),
    cors = require('cors'),
    app = express();

const {check, validationResult} = require('express-validator');


// initialize models
const Movies = Models.Movie;
const Users = Models.User;

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

// connect to mongodb database
// mongoose.connect('mongodb://localhost:27017/myFlix', { useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connect('mongodb+srv://myFlixDBadmin:Oranges12073078@myflixdb.xuevxuy.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true});


// use modules
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // If a specific origin isn't found on the lsit of allowed origins
            let message = "The CORS policy for this application doesn't allow access from origin " + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));


// import auth.js
let auth = require('./auth')(app);
const passport = require('passport');

require('./passport.js')

// CREATE REQUESTS //
// POST request to add new registered user
app.post('/users', 
    // validation logic
    [
        check('Username','username is required').isLength({min: 5}), // validate username is not empty and has a minimum of 5 characters
        check('Username', 'Username contain non alphanumberic characters - not allowed').isAlphanumeric(), // validate username is alphanumeric
        check('Password', 'Password is required').not().isEmpty(), // validate password is not empty
        check('Email', 'Email does not appear to be valid').isEmail() // validate email is in email format
    ],
    (req,res) => {

        // check for validation result
        let errors = validationResult(req);
        if (!errors.isEmpty) {
            return res.status(422).json({error: errors.array()});
        }

        // hash user password
        let hashedPassword = Users.hashedPassword(req.body.Password);

        // duplicated username check
        Users.findOne({ Username: req.body.Username }).then(user => 
        {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                }).then(user => {
                    return res.status(201).json(user);
                }).catch(error => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                })
            }
        }).catch(error => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// POST request to add a movie to a user's favorite movie
app.post('/users/:id/:movieTitle', passport.authenticate('jwt', { session: false}), (req, res) => {

    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        return res.status(201).send(`${movieTitle} has been added to user ${id}'s array`)
    } else {
        return res.status(400).send("No such user")
    }

});


// PUT request to update user information by username
app.put('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {

    let user = req.body;

    Users.findOneAndUpdate({Username: user.Username}, {$set: 
        {
            Username: user.Username,
            Password: user.Password,
            Email: user.Email,
            Birthday: user.Birthday,
            FavoriteMovies: user.FavoriteMovies
        }
    },
    { new: true }).then( updatedUser => {
        return res.status(200).json(updatedUser);
    }).catch(error => {
        console.error(error);
        return res.status(500).send('Error: ' + error);
    })
});


// PUT request to add favorite movies to a user based on username
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
       $push: { FavoriteMovies: req.params.MovieID }
     },
     { new: true }).then(updatedUser => {
        return res.status(200).json(updatedUser);
     }).catch(error => {
        console.error(err);
        return res.status(500).send('Error: ' + err);
     })
  });


// DELETE REQUESTS //
// DELETE request to remove a movie from a user's favorite movies
app.delete('/users/:Username/:movieID', passport.authenticate('jwt', { session: false}), (req, res) => {
    
    Users.find(
        {Username: req.params.Username}
    ).then(user => {
        if (!user.length) {
            return res.status(400).send(req.params.Username + ' was not found.');
        } else {
            Users.findOneAndUpdate(
                {Username: req.params.Username},
                {$pull: {FavoriteMovies: req.params.movieID}},
                {new: true}
            ).then(updatedUser => {
                return res.status(200).json(updatedUser);
            }).catch(error => {
                console.error(error);
                return res.status(500).send('Error: ' + error);
            })
        }
    })

});


// DELETE request to remove a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
    const username = req.params.Username;

    Users.findOneAndDelete(
        {Username: username}
    ).then(user => {
        if (!user) {
            return res.status(400).send(user + ' was not found.');
        } else {
            return res.status(200).send(user + ' was deleted.');
        }
    }).catch(error => {
        console.error(error);
        return res.status(500).send('Error: ' + error)
    });
});


// READ REQUESTS //
// GET request for landing page
app.get('/', (req, res) => {
    return res.status(200).send('Welcome to the myFlix API');
})



// GET request to pull the list of movies
app.get('/movies', passport.authenticate('jwt', { session: false}), (req, res) => {
    
    Movies.find().then(movies => {
        return res.status(200).json(movies);
    }).catch(error => {
        console.error(error);
        return res.status(500).send('Error: ' + error);
    })

});

// GET request to pull API documentation
app.get('/documentation', passport.authenticate('jwt', { session: false}), (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

// GET request to pull a specific movie based on the provided title
app.get('/movies/:title', passport.authenticate('jwt', { session: false}), (req, res) => {
    const { title } = req.params;

    Movies.findOne({Title: title}).then(movie => {
        
        if (!movie) {
            return res.status(400).send(title + ' is not found in our database.')    
        } else {
            return res.status(200).json(movie);
        }
    }).catch( error => {
        return res.status(50).send('Error: ' + error);
    });

});

// GET request to pull data on a specific genre
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false}), (req, res) => {
    
    const { genreName } = req.params;

    Movies.find({"Genre.Name": genreName}).then(movie => {
        
        if (!movie.length) {
            return res.status(400).send('No such genre');
        } else {
            return res.status(200).json(movie);
        }
    }).catch(error => {
        console.error(error);
        return res.status(500).send('Error: ' + error);
    })
});


// GET request to pull data on a specific director
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false}), (req, res) => {
    
    const { directorName } = req.params;
    console.log(directorName)

    Movies.findOne({"Director.Name": directorName}).then(movie => {
        if (!movie) {
            return res.status(400).send('No such director');
        } else {
            return res.status(200).json(movie.Director);
        }
    }).catch(error => {
        console.error(error);
        return res.status(500).send('Error: ' + error);
    })

});

// list for port 8080
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening to port ' + port);
});