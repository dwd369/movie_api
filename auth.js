const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport') // Your local passport file

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, // This is the username you're encoding in the JWT
        expiresIn: '7d', // This specifies that the token will expire in 7 days
        algorithm: 'HS256' // This is the algorithm used to "sign" or encode the values of the JWT
    });
}


/**
 * send JWTToken to user upon authenticating user credential
 *
 * @function
 * @description thie function handles user login. Once the user is authenticated, JWT token is then sent to the user
 * @param {req} - the body of the request contains the username and password
 * @returns {user} returns user object for reference upon successful authentication
 * @returns {token} Returns JWT token to user upon succesful authentication
 * @throws {Error} If there is an issue with user creation.
 *
 */
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false}, (error, user, info) => {

            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }

            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
};