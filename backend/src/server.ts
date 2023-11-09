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
    preflightContinue: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH' , 'DELETE', 'OPTIONS'],
}));

app.use(session({
    name: 'sitedata',
    secret: process.env.SESSION_SECRET!,
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

    // Pronađi filmove sličnog naziva
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

    // Pronađi filmove sličnog naziva
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
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(422).send({ error: "Missing username or password property on body!" });

    // Je li Auth ispravan odnosno je li korisnik taj postoji s tom lozinkom
    try {
        // Šaljemo grešku o tome je li username ili password kriv
        const result = await pool.query(`SELECT username FROM korisnici WHERE password = $1`, [password]);
        if (!result.rowCount) return res.status(404).send({ error: 'Incorrect password' });
        if (username !== result.rows[0].username) return res.status(404).send({ error: 'Incorrect Username' });
        req.session.username = result.rows[0].username;
        return res.status(200).send({ username: req.session.username });
    } catch(err) {
        console.error(err);
        return res.status(500).send({ error: JSON.stringify(err) });
    }
});

app.post('/secure/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(422).send({ error: "Missing username or password property on body!" });

    // Je li Auth ispravan odnosno je li korisnik taj postoji s tom lozinkom
    try {
        const result = await pool.query(`SELECT username FROM korisnici WHERE username = $1 AND password = $2`, [username, password]);
        if (!result.rowCount) return res.status(404).send({ error: 'User not found' }); // šaljemo generičku poruku koja ne daje previše informacija o tome je li username ili password krivi
        req.session.username = result.rows[0].username;
        return res.status(200).send({ username: req.session.username });
    } catch(err) {
        console.error(err);
        return res.status(500).send({ error: JSON.stringify(err) });
    }
});

// Ako je korisnik logiran vrati podatke o njemu, služi za frontend da provjeri ako je korisnik logiran pri refreshu
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
            res.clearCookie('sitedata').sendStatus(200);
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
