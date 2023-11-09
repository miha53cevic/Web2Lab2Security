import React from 'react';
import axios, { AxiosError } from "axios";
import { Formik } from "formik";
import { Button, Card, FloatingLabel, Form } from "react-bootstrap";

export interface FormData {
    username: string,
    password: string,
    ranjivost: boolean,
}

const initialValues: FormData = {
    username: '',
    password: '',
    ranjivost: false,
};

function BrokenAuth() {
    const [error, setError] = React.useState<string | undefined>();
    const [user, setUser] = React.useState<{ username: string } | null>(null);

    // U prvom učitavanju stranice provjeri ako korisnik već ima cookie odnosno je logiran/prijavljen
    React.useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user`, {
                    withCredentials: true, // šalji cookie
                });
                setUser(res.data);
            } catch (err) {
                // korisnik nije logiran nastavi
            }
        })();
    }, []);

    async function handleLogout() {
        try {
            await axios.get(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
                withCredentials: true, // šalji cookie
            });
            setUser(null);
            setError(undefined);
        } catch (err) {
            setError(JSON.stringify((err as AxiosError).response?.data));
        }
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={async (values) => {
                console.log(values);

                // Posalji zahtjev sa ranjivosti omogucenom ili onemogucenom
                const url = values.ranjivost ? `${import.meta.env.VITE_BACKEND_URL}/login` : `${import.meta.env.VITE_BACKEND_URL}/secure/login`;
                const data = {
                    username: values.username,
                    password: values.password,
                };
                try {
                    const res = await axios.post(url, data, {
                        withCredentials: true, // šalji cookie
                    });
                    setUser(res.data);
                    setError(undefined);
                } catch (err) {
                    setError(JSON.stringify((err as AxiosError).response?.data));
                }
            }}
        >
            {(formik) => (
                <Form onSubmit={formik.handleSubmit}>
                    <p>
                        <b>Upute:</b> Ako nije uključena ranjivost, korisniku se daje informacije o tome je li krivo unio lozinku ili korisničko ime, što omogućava napadaču lakše pogađanje korisničkih računa.
                        Ako je ranjivost isključena korisnik prima samo generičku poruku "User not found" koja mu ne govori da li je pogrešio korisničko ime ili lozinku.
                        <br />Naredbe za isprobat: <code>username: test password: password123</code><br />
                        <code>username: tes password: password123 (u ranjivom načinu se ispisuje "Incorrect username")</code><br />
                        <code>username: test password: pasword123 (u ranjivom načinu se ispisuje "Incorrect password")</code>
                    </p>
                    <Card>
                        <Card.Header>
                            Loša autentifikacija (Broken Authentication)
                            <br />
                            Ranjivost omogućena: <Form.Switch className='d-inline-block align-middle' {...formik.getFieldProps('ranjivost')} />
                        </Card.Header>
                        <Card.Body>
                            {!user ?
                                <>
                                    <Card.Title>Prijava korisnika</Card.Title>
                                    <Form.Group>
                                        <FloatingLabel
                                            label="Username"
                                            className='mb-3'
                                        >
                                            <Form.Control type="text" placeholder="" required {...formik.getFieldProps('username')} />
                                        </FloatingLabel>
                                        <FloatingLabel
                                            label="Password"
                                            className='mb-3'
                                        >
                                            <Form.Control type="password" placeholder="" required {...formik.getFieldProps('password')} />
                                        </FloatingLabel>
                                        <Button type='submit' variant='primary'>Login</Button>
                                    </Form.Group>
                                </>
                                :
                                <>
                                    <Card.Title>Pozdrav, {user.username}</Card.Title>
                                    <Form.Group>
                                        <Button onClick={handleLogout} variant='primary'>Logout</Button>
                                    </Form.Group>
                                </>
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

export default BrokenAuth;