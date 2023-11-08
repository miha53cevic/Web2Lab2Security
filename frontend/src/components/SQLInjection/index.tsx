import { Card, FloatingLabel, Button, Form } from "react-bootstrap";
import { Formik } from "formik";

export interface FormData {
    nazivFilma: string,
    ranjivost: boolean,
}

const initialValues: FormData = {
    nazivFilma: '',
    ranjivost: false,
};

function SQLInjection() {
    return (
        <Formik
            initialValues={initialValues}
            onSubmit={(values) => {
                console.log(values);
            }}
        >
            {(formik) => (
                <Form onSubmit={formik.handleSubmit}>
                    <Card>
                        <Card.Header>
                            SQL umetanje (SQL Injection)
                            <br />
                            Ranjivost omogućena: <Form.Switch className='d-inline-block align-middle' {...formik.getFieldProps('ranjivost')} />
                        </Card.Header>
                        <Card.Body>
                            <Card.Title>Informacije o filmovima</Card.Title>
                            <Form.Group>
                                <FloatingLabel
                                    label="Naziv filma"
                                    className='mb-3'
                                >
                                    <Form.Control type="text" placeholder="" required {...formik.getFieldProps('nazivFilma')} />
                                </FloatingLabel>
                                <Button type='submit' variant='primary'>Dohvati informacije</Button>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Form>
            )}
        </Formik>
    );
}

export default SQLInjection;