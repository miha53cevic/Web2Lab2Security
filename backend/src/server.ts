import express from 'express';
import session from 'express-session';
import { Pool } from 'pg';
import cors from 'cors';
import 'dotenv/config';

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION,
    ssl: (process.env.NODE_ENV === 'development') ? false
        : {
            rejectUnauthorized: false,
        }
});

const app = express();

// za heroku je trebal valjda i za render onda
app.set("trust proxy", 1);
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true, // cookie ne prolazi inace sa sid
    preflightContinue: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH' , 'DELETE', 'OPTIONS'],
}));

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

// Index odnosno default ruta
app.get('/', (req, res) => {
    res.send(`<h1>Running on port: ${port}</h1>`);
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SQL Injection
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/film', async (req, res) => {
    const { nazivFilma } = req.query;

    if (!nazivFilma)
        return res.status(422).send({ error: "nazivFilma nije zadan!" });

    try {
        const parametar = (nazivFilma as string).toLocaleLowerCase();
        const result = await pool.query(`SELECT nazivFilma, redatelj, slikaUrl FROM filmovi WHERE LOWER(nazivFilma) LIKE '%${parametar}%'`);
        return res.status(200).send(result.rows);
    } catch(err) {
        // Nesigurna verzija vraca i javlja greske korisniku
        console.error(err);
        return res.status(500).send({ error: JSON.stringify(err) });
    } 
});

app.get('/secure/film', async (req, res) => {
    const { nazivFilma } = req.query;

    if (!nazivFilma)
        return res.status(422).send({ error: "nazivFilma nije zadan!" });

    try {
        const parametar = (nazivFilma as string).toLocaleLowerCase();
        const result = await pool.query(`SELECT nazivFilma, redatelj, slikaUrl FROM filmovi WHERE LOWER(nazivFilma) LIKE ('%' || $1 || '%')`, [parametar]);
        return res.status(200).send(result.rows);
    } catch(err) {
        // Od razlike od nesigurnog nacina ako se dogodi greska samo vrati da nisi pronasao taj film
        console.error(err);
        return res.status(200).send([]);
    } 
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Broken Authentication
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Usersi koji postoje u "bazi"
const users = [
    { username: "Bob" },
    { username: "User" },
    { username: "Mihael" },
];

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
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Default route (404 not found)
app.use((req, res) => {
    res.sendStatus(404);
})

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Running on port ${port}`);
});
