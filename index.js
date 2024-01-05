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
const Directors = Models.Director;

// define allowed origins/domains
//let allowedOrigins = ['http://localhost:8080', 'https://dd-myflix.herokuapp.com/'];

// connect to mongodb database
// mongoose.connect('mongodb://localhost:27017/myFlix', { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true});


// use modules
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*********************** CORS POLICY ***********************/
// include CORS with express
// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.indexOf(origin) === -1) {

//             // If a specific origin isn't found on the lsit of allowed origins
//             let message = "The CORS policy for this application doesn't allow access from origin " + origin;
//             return callback(new Error(message), false);

//         }
//         return callback(null, true);
//     }
// }));

// include CORS to allow access from all domains
app.use(cors());


// import auth.js
let auth = require('./auth')(app);
const passport = require('passport');

require('./passport.js');

/**
 * POST request to handle user registration
 *
 * @function
 * @description this function handles user registration via POST request. It takes the user object from the body and validates it prior to processing it into the database.
 * @memberof app
 * @param {req.body} user - The data for the new user.
 * @param {token} jwt token - JWT token from the user
 * @returns {res} The response fro mthe HTTP post request
 * @throws {Error} If there is an issue with user creation.
 *
 */
app.post('/users', 
    // validation logic
    [
        check('Username','username is required').isLength({min: 5}), // validate username is not empty and has a minimum of 5 characters
        check('Username', 'Username contain non alphanumberic characters - not allowed').isAlphanumeric(), // validate username is alphanumeric
        check('Password', 'Password is required').notEmpty(), // validate password is not empty
        check('Email', 'Email does not appear to be valid').isEmail(), // validate email is in email format
        check('Birthday', 'Birthday must be in format of YYYY-MM-DD').isDate().optional({nullable: true}) // if date is present, check if it is a date in the format of YYYY-MM-DD
    ],
    (req,res) => {

        // check for validation result
        let errors = validationResult(req);
        

        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        // hash user password
        let hashedPassword = Users.hashPassword(req.body.Password);

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
                    Birthday: req.body.Birthday,
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

/**
 * PUT request to update user information by username
 *
 * @function
 * @description this function handles updating the user information. It takes the userdata from the request body and updates the user object via MongoDB. It validstes the errors first prior to updating the user object.
 * @param {req} - The updated userdata is stored within the request body
 * @param {token} - JWT token from the user
 * @returns {res} The response fro mthe HTTP post request
 * @throws {Error} If there is an issue with user creation.
 *
 */
app.put('/users/:Username', 
    [
        check('Username','username is required').isLength({min: 5}), // validate username is not empty and has a minimum of 5 characters
        check('Username', 'Username contain non alphanumberic characters - not allowed').isAlphanumeric(), // validate username is alphanumeric
        check('Password', 'Password is required').not().isEmpty(), // validate password is not empty
        check('Email', 'Email does not appear to be valid').isEmail(), // validate email is in email format
        check('Birthday', 'Birthday must be in format of YYYY-MM-DD').isDate().optional({nullable: true}) // if date is present, check if it is a date in the format of YYYY-MM-DD
    ], 
    passport.authenticate('jwt', { session: false}), 
    (req, res) => {
    
    if(req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }

    // check for errors
    // let errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //     return res.status(422).json({errors: errors.array()});
    // }

    let user = req.body;
    let hashedPassword = Users.hashPassword(req.body.Password);


    Users.findOneAndUpdate({Username: user.Username}, {$set: 
        {
            Username: user.Username,
            Password: hashedPassword,
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

/**
 * PUT request to add a movie to a user's favorite movie
 *
 * @function
 * @description this function handles adding a favorite movie to the user object in MongoDB via POST request. It takes the userName and MovieId from the URL and add the movieId to the userID
 * @param {Username} - The username of the user
 * @param {MovieID} - The corresponding ID of the movie
 * @param {token} - JWT token from the user
 * @returns {res} The response fro mthe HTTP post request
 * @throws {Error} If there is an issue with user creation.
 *
 */
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


/**
 * DELETE request to remove a movie from a user's favorite movies
 *
 * @function
 * @description this function removes a movie from the user's favoritemovies. It takes the Username and MovieID from the URL and remove the MovieID from the corresponding user
 * @param {Username} - The username of the user
 * @param {MovieID} - The corresponding ID of the movie
 * @param {token} - JWT token from the user
 * @returns {res} The response fro mthe HTTP post request
 * @throws {Error} If there is an issue with user creation.
 *
 */
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

/**
 * DELETE request to remove a user by username
 *
 * @function
 * @description this function removes the user using the Username from the user object in MongoDB.
 * @param {Username} - The username of the user
 * @param {token} - JWT token from the user
 * @returns {res} The response fro mthe HTTP post request
 * @throws {Error} If there is an issue with user creation.
 *
 */
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


// GET request for landing page
app.get('/', (req, res) => {
    return res.status(200).send('Welcome to the myFlix API');
})


/**
 * GET request to pull the list of movies
 *
 * @function
 * @description this function fetches the list of movies that are available in the database via GET request
 * @param {token} jwt token - JWT token from the user
 * @returns {res} The response fro mthe HTTP post request
 * @throws {Error} If there is an issue with user creation.
 *
 */
app.get('/movies', passport.authenticate('jwt', { session: false}), (req, res) => {
    
    Movies.find().then(movies => {
        console.log(movies);
        return res.status(200).json(movies);
    }).catch(error => {
        console.error(error);
        return res.status(500).send('Error: ' + error);
    })

});

/**
 * GET request to genereate the API documentation
 *
 * @function
 * @description this function genereates the API documents 
 * @returns {res} API documentation is sent via the res body
 *
 */
app.get('/documentation', passport.authenticate('jwt', { session: false}), (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

/**
 * GET request to pull a specific movie based on the provided title
 *
 * @function
 * @description this function fetches the details of a movie using the movie title
 * @param {title} - title of the movie with. The value will be parsed
 * @param {token} jwt token - JWT token from the user
 * @returns {res} The response fro mthe HTTP post request
 * @throws {Error} If there is an issue with user creation.
 *
 */
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

/**
 * GET request to pull data on a specific genre
 *
 * @function
 * @description this function fetches the movies that are in a specific genre. The genre is provided in the URL
 * @param {genreName} - User specified genre
 * @param {token} jwt token - JWT token from the user
 * @returns {res} The response fro mthe HTTP post request
 * @throws {Error} If there is an issue with user creation.
 *
 */
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


/**
 * GET request to pull data on a specific director
 *
 * @function
 * @description this function fetches details of a director including name and bio. It takes the name of the director from the URL to look up against the director object
 * @param {name} - Name of the director
 * @param {token} jwt token - JWT token from the user
 * @returns {res} The response fro mthe HTTP post request
 * @throws {Error} If there is an issue with user creation.
 *
 */
app.get('/movies/directors/:name', passport.authenticate('jwt', { session: false}), (req, res) => {
    
    const { name } = req.params;
    console.log(name);

    Directors.findOne({Name: name}).then(director => {
        if (!director) {
            return res.status(400).send('No such director');
        } else {
            return res.status(200).json(director);
        }
    }).catch(error => {
        console.error(error);
        return res.status(500).send('Error: ' + error);
    })

    // Movies.findOne({"Director.Name": directorName}).then(movie => {
    //     if (!movie) {
    //         return res.status(400).send('No such director');
    //     } else {
    //         return res.status(200).json(movie.Director);
    //     }
    // }).catch(error => {
    //     console.error(error);
    //     return res.status(500).send('Error: ' + error);
    // })

});

// list for port 8080
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening to port ' + port);
});