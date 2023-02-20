import { Link, useLocation } from "wouter";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { observer } from "mobx-react-lite";
import { AuthState } from "./state/AuthState";

// import bootstrap css and js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import { BaseRouter } from "./routers/BaseRouter";

const homeNav = [
  ['/', 'Home'],
  ['/fruits', 'Fruits'],
  ['/logout', 'Logout'],
]

const authNav = [
  ['/', 'Login'],
  ['/register', 'Register'],
]

const App = observer(() => {
  const [location] = useLocation()
  const nav = AuthState.loggedIn ? homeNav : authNav
  return (
    <>
      <Navbar bg="light" expand="sm" collapseOnSelect>
        <Container>
          <Link href="/">
            <Navbar.Brand>React-Bootstrap</Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {nav.map(([href, text], i) => (
                <Link href={href} key={i}>
                  <Nav.Link active={location === href}>{text}</Nav.Link>
                </Link>
              ))}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <BaseRouter />
      </Container>
    </>
  )
})

export default App
