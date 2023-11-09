import React from 'react';
import { Card, FloatingLabel, Button, Form } from "react-bootstrap";
import { Formik } from "formik";
import axios, { AxiosError } from "axios";

export interface FormData {
    nazivFilma: string,
    ranjivost: boolean,
    regexProvjera: boolean,
}

const initialValues: FormData = {
    nazivFilma: '',
    ranjivost: false,
    regexProvjera: false,
};

export interface Film {
    nazivfilma: string,
    redatelj: string,
    slikaurl: string,
}

function SQLInjection() {
    const [films, setFilms] = React.useState<Film[] | null>(null);
    const [error, setError] = React.useState<string | undefined>();

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={async (values) => {
                console.log(values);

                // Dodatno provjer na klijentu unos ako koristimo sigurnu verziju
                if (values.regexProvjera) {
                    // Kod iz slajda 17 predavanje 03-Sigurnost
                    if (!values.nazivFilma.match(/^[a-zA-Z0-9_-]+$/)) {
                        alert("Unijeli ste neispravan unos.");
                        setFilms(null);
                        setError(undefined);
                        return;
                    }
                }

                // Posalji zahtjev sa ranjivosti omogucenom
                const url = values.ranjivost ? `${import.meta.env.VITE_BACKEND_URL}/film` : `${import.meta.env.VITE_BACKEND_URL}/secure/film`;
                try {
                    const res = await axios.get(url, {
                        params: { nazivFilma: values.nazivFilma }
                    });
                    setFilms(res.data);
                    setError(undefined);
                } catch (err) {
                    setFilms(null);
                    setError(JSON.stringify((err as AxiosError).response?.data));
                }
            }}
        >
            {(formik) => (
                <Form onSubmit={formik.handleSubmit}>
                    <p>
                        <b>Upute:</b> Ako nije uključena ranjivost koristi se parametrizirani upiti te u slučaju nekih sintaksnih pogrešaka ili 
                        nešto sličnog tjekom upita se ne vraćaju korisniku informacije o grešci već samo informacija da traženi film nije pronađen.
                        <br/> U slučaju da ranjivost je uključena u sql upit se direktno stavlja unos korisnika (stavlja se unos unutar stringa).
                        Osim toga također se ispisuju pogreške o upitu koje vraća baza podataka (mogu se izvoditi ilegalni upiti i sljepo napadanje). Još dodatno je implementirana
                        i regex provjera na klijentu koja se može uključiti opcijom.<br/>
                        <br/>Naredbe za isprobat: <code>'-- (radi jer je upit oblika LIKE '%parametar%' pa ako se stavi '-- ispada LIKE '%'--' što uvjek vrijedi)</code><br/>
                        <code>'ORDER BY 1-- (može se saznati da se koriste 3 atributa u naredbi, ORDER BY 4 vraća grešku)</code><br/>
                        <code>'UNION SELECT table_name, NULL, NULL FROM information_schema.tables-- (ispisuju se podaci o bazi)</code>
                    </p>
                    <Card>
                        <Card.Header>
                            SQL umetanje (SQL Injection)
                            <br />
                            Ranjivost omogućena: <Form.Switch className='d-inline-block align-middle' {...formik.getFieldProps('ranjivost')} />
                            <br/>
                            Uključi dodatnu regex provjeru na klijentu: <Form.Switch className='d-inline-block align-middle' {...formik.getFieldProps('regexProvjera')} />
                        </Card.Header>
                        <Card.Body>
                            <Card.Title>Pretraži filmove</Card.Title>
                            <Form.Group>
                                <FloatingLabel
                                    label="Naziv filma"
                                    className='mb-3'
                                >
                                    <Form.Control type="text" placeholder="" required {...formik.getFieldProps('nazivFilma')} />
                                </FloatingLabel>
                                <Button type='submit' variant='primary'>Pretraži</Button>
                            </Form.Group>
                            {films &&
                                films.map((film, i) => (
                                    <div key={i}>
                                        <br />
                                        <h4>{film.nazivfilma}</h4>
                                        <h6>{film.redatelj}</h6>
                                        <img src={film.slikaurl} alt='filmSlika' />
                                    </div>
                                ))
                            }
                            {films && !films.length &&
                                <div>
                                    <br />
                                    <p>Ne postoji film pod tim nazivom</p>
                                </div>
                            }
                            {error &&
                                <p className='text-danger'>{error}</p>
                            }
                        </Card.Body>
                    </Card>
                </Form>
            )}
        </Formik>
    );
}

export default SQLInjection;