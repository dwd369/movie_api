// initialize modules
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    uuid = require('uuid'),
    Models = require('./model.js')
    app = express();


// initialize models
const Movies = Models.Movie;
const Users = Models.User;

// connect to mongodb database
mongoose.connect('mongodb://localhost:27017/myFlix', { useNewUrlParser: true, useUnifiedTopology: true});

// use modules
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// CREATE REQUESTS //
// POST request to add new registered user
app.post('/users', (req,res) => {

    Users.findOne({ Username: req.body.Username }).then(user => 
    {
        if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users.create({
                Username: req.body.Username,
                Password: req.body.Password,
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
app.post('/users/:id/:movieTitle', (req, res) => {

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
app.put('/users/:Username', (req, res) => {

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
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username/:movieID', (req, res) => {
    
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
app.delete('/users/:Username', (req, res) => {
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
// GET request to pull the list of movies
app.get('/movies', (req, res) => {
    
    Movies.find().then(movies => {
        return res.status(200).json(movies);
    }).catch(error => {
        console.error(error);
        return res.status(500).send('Error: ' + error);
    })

});

// GET request to pull API documentation
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

// GET request to pull a specific movie based on the provided title
app.get('/movies/:title', (req, res) => {
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
app.get('/movies/genre/:genreName', (req, res) => {
    
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
app.get('/movies/directors/:directorName', (req, res) => {
    
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

// // LESSON EXAMPLE
// // GET all users
// app.get('/users', (req, res) => {
//     Users.find().then(users => {
//         return res.json(users);
//     }).catch(error => {
//         console.error(error);
//         return res.status(500).send('Error: ' + error)
//     })
// });

// // LESSON EXAMPLE
// // GET user by username
// app.get('/users/:Username', (req, res) => {
//     const { username } = req.params;

//     Users.findOne({Username: username}).then(user => {
//         return res.status(200).json(user);
//     }).catch(error => {
//         console.error(error);
//         res.status(500).send('Error: ' + error);    
//     })
// });

// list for port 8080
app.listen(8080, () => console.log("listening on 8080"));