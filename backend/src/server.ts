import express from 'express';
import session from 'express-session';
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString:
});

const app = express();

app.set("trust proxy", 1);
app.use(express.json());

app.use(session({
    name: 'sitedata',
    secret: 'the secret to rule all secrets!',
    resave: false, 
    saveUninitialized: false,  
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // cookie is valid for 24h
        secure: process.env.NODE_ENV === 'production',    
        httpOnly: process.env.NODE_ENV === 'production',
    }
}));

app.get('/', (req, res) => {
    res.send(`<h1>Running on port: ${port}</h1>`);
});

// Usersi koji postoje u "bazi"
const users = [
    { username: "Bob" },
    { username: "User" },
    { username: "Mihael" },
];

app.post('/film', (req, res) => {
    const nazivFilma = req.query;

    if (!nazivFilma)
        return res.status(422).send({ error: "nazivFilma nije zadan!" });

    
});

app.post('/login', (req, res) => {
    const data = req.body;

    if (!data || !data.username)
        return res.status(422).send({ error: "Missing username property on body!" });

    // Check if user exists
    if (!users.some(user => user.username === data.username))
        return res.sendStatus(401);

    req.session.username = data.username;    // create session
    return res.sendStatus(200);
});

app.get('/user', (req, res) => {
    if (!req.session.username)
        return res.status(401).send({ error: "Not logged in!" });
    else return res.send({ username: req.session.username });
});

app.get('/logout', (req, res) => {
    if (!req.session.username) {
        res.status(401).send({ error: "Not logged in!" });
        return;
    } else {
        req.session.destroy((err) => {
            console.log(err);
            res.sendStatus(200);
        })
    };
});

// Default route (404 not found)
app.use((req, res) => {
    res.sendStatus(404);
})


const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Running on port ${port}`);
});