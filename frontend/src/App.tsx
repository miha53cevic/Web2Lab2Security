import { Navbar, Container } from "react-bootstrap";

import SQLInjection from './components/SQLInjection';
import BrokenAuth from "./components/BrokenAuth";

function App() {
    return (
        <main>
            <Navbar bg='info' className='rounded'>
                <Container>
                    <Navbar.Brand href="/">
                        <img src='/icon.svg' width='32px' height='32px' alt='logo' className="d-inline-block align-top me-3" />
                        Web2Lab2 Sigurnost
                    </Navbar.Brand>
                </Container>
            </Navbar>
            <br />
            <Container>
                <SQLInjection />
                <br /><br />
                <BrokenAuth />
            </Container>
            <br/>
        </main >
    );
}

export default App;
