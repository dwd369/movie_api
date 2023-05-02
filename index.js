// initialize modules
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    app = express();

// use modules
app.use(bodyParser.json());

// define users and movies object
let users = [
    {
        "id": 1,
        "name": "John Smith",
        "favoriteMovies": ["The Matrix"]
    },
    {
        "id": 2,
        "name": "Bob Saggot",
        "favoriteMovies": []
    }
];

let movies = [
    {
        "Title": "The Matrix",
        "Description": 'Neo (Keanu Reeves) believes that Morpheus (Laurence Fishburne), an elusive figure considered to be the most dangerous man alive, can answer his question -- What is the Matrix? Neo is contacted by Trinity (Carrie-Anne Moss), a beautiful stranger who leads him into an underworld where he meets Morpheus. They fight a brutal battle for their lives against a cadre of viciously intelligent secret agents. It is a truth that could cost Neo something more precious than his life.',
        "Genre": {
            "Name": "Sci-fi",
            "Description": "Science fiction (or sci-fi) is a film genre that uses speculative, fictional science-based depictions of phenomena that are not fully accepted by mainstream science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, dinosaurs, mutants, interstellar travel, time travel, or other technologies."
        },
        "Director": {
            "Name": "Lana Wachowski",
            "Bio": 'Lana WachowskiBorn to mother Lynne, a nurse, and father Ron, a businessman of Polish descent, Wachowski grew up in Chicago and formed a tight creative relationship with her sister Lilly. After the siblings dropped out of college, they started a construction business and wrote screenplays.',
            "BirthYear": 1965,
            "DeathYear": ''
        },
        "ImageURL": "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg"
    },
    {
        "Title": 'The Matrix Reloaded',
        "Description": 'Freedom fighters Neo, Trinity and Morpheus continue to lead the revolt against the Machine Army, unleashing their arsenal of extraordinary skills and weaponry against the systematic forces of repression and exploitation.',
        "Genre": {
            "Name": "Sci-fi",
            "Description": "Science fiction (or sci-fi) is a film genre that uses speculative, fictional science-based depictions of phenomena that are not fully accepted by mainstream science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, dinosaurs, mutants, interstellar travel, time travel, or other technologies."
        },
        "Director": {
            "Name": "Lana Wachowski",
            "Bio": 'Lana WachowskiBorn to mother Lynne, a nurse, and father Ron, a businessman of Polish descent, Wachowski grew up in Chicago and formed a tight creative relationship with her sister Lilly. After the siblings dropped out of college, they started a construction business and wrote screenplays.',
            "BirthYear": 1965,
            "DeathYear": ''
        },
        "ImageURL": 'https://m.media-amazon.com/images/M/MV5BODE0MzZhZTgtYzkwYi00YmI5LThlZWYtOWRmNWE5ODk0NzMxXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg'
    },
    {
        "Title": "The Matrix Revolutions",
        "Description": "The human city of Zion defends itself against the massive invasion of the machines as Neo fights to end the war at another front while also opposing the rogue Agent Smith.",
        "Genre": {
            "Name": "Sci-fi",
            "Description": "Science fiction (or sci-fi) is a film genre that uses speculative, fictional science-based depictions of phenomena that are not fully accepted by mainstream science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, dinosaurs, mutants, interstellar travel, time travel, or other technologies."
        },
        "Director": {
            "Name": "Lana Wachowski",
            "Bio": "Lana WachowskiBorn to mother Lynne, a nurse, and father Ron, a businessman of Polish descent, Wachowski grew up in Chicago and formed a tight creative relationship with her sister Lilly. After the siblings dropped out of college, they started a construction business and wrote screenplays.",
            "BirthYear": 1965,
            "DeathYear": ""
        },
        "ImageURL": "https://m.media-amazon.com/images/M/MV5BNzNlZTZjMDctZjYwNi00NzljLWIwN2QtZWZmYmJiYzQ0MTk2XkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg"
    },
    {
        "Title": 'The Matrix Resurrections',
        "Description": 'Return to a world of two realities: one, everyday life; the other, what lies behind it. To find out if his reality is a construct, to truly know himself, Mr. Anderson will have to choose to follow the white rabbit once more.',
        "Genre": {
            "Name": "Sci-fi",
            "Description": "Science fiction (or sci-fi) is a film genre that uses speculative, fictional science-based depictions of phenomena that are not fully accepted by mainstream science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, dinosaurs, mutants, interstellar travel, time travel, or other technologies."
        },
        "Director": {
            "Name": "Lana Wachowski",
            "Bio": "Lana WachowskiBorn to mother Lynne, a nurse, and father Ron, a businessman of Polish descent, Wachowski grew up in Chicago and formed a tight creative relationship with her sister Lilly. After the siblings dropped out of college, they started a construction business and wrote screenplays.",
            "BirthYear": 1965,
            "DeathYear": ""
        },
        "ImageURL": "https://m.media-amazon.com/images/M/MV5BMGJkNDJlZWUtOGM1Ny00YjNkLThiM2QtY2ZjMzQxMTIxNWNmXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg"
    },
    {
        "Title": "Gone Girl",
        "Description": "With his wife's disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him when it's suspected that he may not be innocent.",
        "Genre": {
            "Name": "Thriller",
            "Description": "Thriller is a genre of fiction with numerous, often overlapping, subgenres, including crime, horror and detective fiction. "
        },
        "Director": {
            "Name": "David Fincher",
            "Bio": "David Andrew Leo Fincher (born August 28, 1962) is an American film director. His films, mostly psychological thrillers, have received 40 nominations at the Academy Awards, including three for him as Best Director. Denver, Colorado, U.S. Born in Denver, Colorado, Fincher was interested in filmmaking at an early age.",
            "BirthYear": 1980,
            "DeathYear": ""
        },
        "ImageURL": "https://m.media-amazon.com/images/M/MV5BMTk0MDQ3MzAzOV5BMl5BanBnXkFtZTgwNzU1NzE3MjE@._V1_FMjpg_UX1000_.jpg"
    },
    {
        "Title": "Inception",
        "Description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
        "Genre": {
            "Name": "Sci-fi",
            "Description": "Science fiction (or sci-fi) is a film genre that uses speculative, fictional science-based depictions of phenomena that are not fully accepted by mainstream science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, dinosaurs, mutants, interstellar travel, time travel, or other technologies."
        },
        "Director": {
            "Name": "Christopher Nolan",
            "Bio": "Christopher Edward Nolan CBE is a British-American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide.",
            "BirthYear": 1970,
            "DeathYear": ''
        },
        "ImageURL": "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg"
    },
    {
        "Title": "Tenet",
        "Description": "Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through a twilight world of international espionage on a mission that will unfold in something beyond real time.",
        "Genre": {
            "Name": "Sci-fi",
            "Description": "Science fiction (or sci-fi) is a film genre that uses speculative, fictional science-based depictions of phenomena that are not fully accepted by mainstream science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, dinosaurs, mutants, interstellar travel, time travel, or other technologies."
        },
        "Director": {
            "Name": "Christopher Nolan",
            "Bio": "Christopher Edward Nolan CBE is a British-American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide.",
            "BirthYear": 1970,
            "DeathYear": ""
        },
        "ImageURL": 'https://m.media-amazon.com/images/M/MV5BMzU3YWYwNTQtZTdiMC00NjY5LTlmMTMtZDFlYTEyODBjMTk5XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg'
    },
    {
        "Title": "Minority Report",
        "Description": 'In a future where a special police unit is able to arrest murderers before they commit their crimes, an officer from that unit is himself accused of a future murder.',
        "Genre": {
            "Name": "Sci-fi",
            "Description": "Science fiction (or sci-fi) is a film genre that uses speculative, fictional science-based depictions of phenomena that are not fully accepted by mainstream science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, dinosaurs, mutants, interstellar travel, time travel, or other technologies."
        },
        "Director": {
            "Name": "Steven Spielberg",
            "Bio": "Steven Allan Spielberg KBE is an American filmmaker. A major figure of the New Hollywood era and pioneer of the modern blockbuster, he is the most commercially successful director in history.",
            "BirthYear": 1946,
            "DeathYear": ""
        },
        "ImageURL": "https://m.media-amazon.com/images/M/MV5BZTI3YzZjZjEtMDdjOC00OWVjLTk0YmYtYzI2MGMwZjFiMzBlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_FMjpg_UX1000_.jpg"
    },
    {
        "Title": "Shutter Island",
        "Description": "In 1954, a U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane.",
        "Genre": {
            "Name": "Thriller",
            "Description": "Thriller is a genre of fiction with numerous, often overlapping, subgenres, including crime, horror and detective fiction. "
        },
        "Director": {
            "Name": "Martin Scorsese",
            "Bio": "Martin Charles Scorsese is an American film director, producer, screenwriter and actor. Scorsese emerged as one of the major figures of the New Hollywood era.",
            "BirthYear": 1942,
            "DeathYear": ""
        },
        "ImageURL": 'https://m.media-amazon.com/images/M/MV5BYzhiNDkyNzktNTZmYS00ZTBkLTk2MDAtM2U0YjU1MzgxZjgzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg'
    },
    {
        "Title": "Memento",
        "Description": "A man with short-term memory loss attempts to track down his wife's murderer.",
        "Genre": {
            "Name": "Thriller",
            "Description": "Thriller is a genre of fiction with numerous, often overlapping, subgenres, including crime, horror and detective fiction. "
        },
        "Director": {
            "Name": "Christopher Nolan",
            "Bio": "Christopher Edward Nolan CBE is a British-American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide.",
            "BirthYear": 1970,
            "DeathYear": ""
        },
        "ImageURL": "https://m.media-amazon.com/images/M/MV5BZTcyNjk1MjgtOWI3Mi00YzQwLWI5MTktMzY4ZmI2NDAyNzYzXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_FMjpg_UX1000_.jpg"
    }
];


// CREATE REQUESTS //
// POST request to add new registered user
app.post('/users', (req,res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        return res.status(200).json(newUser);
    } else {
        res.status(400).send('User needs name');
    }

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


// UPDATE REQUESTS //
// PUT request to update user information
app.put('/users/:id', (req,res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        return res.status(200).json(user);
    } else {
        return res.status(400).send("User not found");
    }

});


// DELETE REQUESTS //
// DELETE request to remove a movie from a user's favorite movies
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        return res.status(201).send(`${movieTitle} has been removed from user ${id}'s array`)
    } else {
        return res.status(400).send("No such user")
    }

});

// DELETE request to remove a user
app.delete('/users/:id/', (req, res) => {
    
    const { id } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        users = users.filter( user => user.id !== id);
        return res.status(201).send(`user ${id} has been deleted.`);
    } else {
        return res.status(400).send("No such user")
    }

});


// READ REQUESTS //
// GET request to pull the list of movies
app.get('/movies', (req, res) => {
    // send status code and return json files of list of movies
    res.status(200).json(movies);
});

// GET request to pull API documentation
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

// GET request to pull a specific movie based on the provided title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title === title);

    if (movie) {
        return res.status(200).json(movie);
    } else {
        return res.status(400).send("No such movie");
    }

});

// GET request to pull data on a specific genre
app.get('/movies/genre/:genreName', (req, res) => {
    
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        return res.status(200).json(genre);
    } else {
        return res.status(400).send("No such movie genre");
    }

});

// GET request to pull data on a specific director
app.get('/movies/directors/:directorName', (req, res) => {
    
    const { directorName } = req.params;
    const director = movies.find( movie => movie.Director.Name === directorName).Director;

    if (director) {
        return res.status(200).json(director);
    } else {
        return res.status(400).send("No such director");
    }

});

// POST request to add new register user
app.listen(8080, () => console.log("listening on 8080"));
