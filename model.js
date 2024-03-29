const mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

/**
 * Movie schema for MongoDB.
 *
 * @typedef {Object} User
 * @property {string} Title - Movie title
 * @property {string} Description - Movie description
 * @property {object} Genre - Genre of the movie containing genre name and genre description
 * @property {object} Director - Director of the movie containing the director name and director bio
 * @property {Array} Actor - Casted actors in the movie in strings
 * @property {string} ImageURL - containing the URL of the image in string format for the movie
 * @property {Featured} Boolean - Indicated whether the movie is featured on the page
 * 
 */
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});


/**
 * User schema for MongoDB.
 *
 * @typedef {Object} User
 * @property {string} Username - User's username
 * @property {string} Password - User's password
 * @property {string} Email - User's email
 * @property {Birthday} Birthday - User's birthday
 * @property {Array} FavoriteMovies - User's favorite movies in the format of array, should store the movieID as a string
 * 
 */
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [mongoose.Schema.Types.ObjectId]
});

/**
 * User schema for MongoDB.
 *
 * @typedef {Object} Director
 * @property {string} Name - Name of the director
 * @property {string} Bio - Biography of the director
 * @property {date} Birthday - Birthday of the director
 * @property {date} Deathyear - If applicable, death date of the director
 * 
 */
let directorSchema = mongoose.Schema({
    Name: {type: String, required: true},
    Bio: {type: String, required: true},
    Birthday: {type: Date, required: true},
    Deathyear: Date
});

// add bcrypt functions to userSchema
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

// add validate function to userSchema
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
}

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('Users', userSchema);
let Director = mongoose.model('Directors', directorSchema);

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Director = Director;